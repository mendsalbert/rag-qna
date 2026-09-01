export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { chunkText } from '@/lib/chunker'
import { requireEnv } from '@/lib/env'
import loadVectorStore from '@/lib/vectorStore'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    requireEnv()

    const { message: text, source } = (await request.json()) as {
      message?: string
      source?: string
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const documents = await chunkText(text, {
      source: source ?? 'manual-input',
      ingestedAt: new Date().toISOString(),
    })

    const vectorStore = await loadVectorStore()
    await vectorStore.addDocuments(documents)

    return NextResponse.json({
      chunksAdded: documents.length,
      source: source ?? 'manual-input',
    })
  } catch (error) {
    console.error('Learn route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to ingest knowledge' },
      { status: 500 },
    )
  }
}
