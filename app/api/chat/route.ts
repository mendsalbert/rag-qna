export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { StreamingTextResponse } from 'ai'
import { type Message } from 'ai/react'
import { NextRequest, NextResponse } from 'next/server'

import { requireEnv } from '@/lib/env'
import { getChatModel } from '@/lib/llm'
import { createRagChain } from '@/lib/rag'
import loadVectorStore from '@/lib/vectorStore'

export async function POST(request: NextRequest) {
  try {
    requireEnv()

    const vectorStore = await loadVectorStore()
    const { messages = [] } = (await request.json()) as { messages: Message[] }
    const userMessages = messages.filter((message) => message.role === 'user')
    const input = userMessages[userMessages.length - 1]?.content

    if (!input?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const llm = getChatModel()
    const retrievalChain = await createRagChain(vectorStore, llm)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let previousAnswer = ''

        try {
          const chainStream = await retrievalChain.stream({
            input,
            chat_history: messages.slice(0, -1).map((message) =>
              message.role === 'user'
                ? new HumanMessage(message.content)
                : new AIMessage(message.content),
            ),
          })

          for await (const chunk of chainStream) {
            if (typeof chunk.answer !== 'string' || !chunk.answer) {
              continue
            }

            const delta = chunk.answer.startsWith(previousAnswer)
              ? chunk.answer.slice(previousAnswer.length)
              : chunk.answer

            previousAnswer = chunk.answer

            if (delta) {
              controller.enqueue(encoder.encode(delta))
            }
          }
        } catch (streamError) {
          console.error('Chat stream error:', streamError)
          controller.enqueue(
            encoder.encode(
              'Sorry, something went wrong while generating a response. Check your API keys and database connection.',
            ),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 },
    )
  }
}
