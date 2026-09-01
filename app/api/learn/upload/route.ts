export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { chunkText } from '@/lib/chunker'
import { extractTextFromFile } from '@/lib/extractFileText'
import { requireEnv } from '@/lib/env'
import loadVectorStore from '@/lib/vectorStore'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    requireEnv()

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required' }, { status: 400 })
    }

    const text = await extractTextFromFile(file)

    const source = `file:${file.name}`
    const documents = await chunkText(text, {
      source,
      ingestedAt: new Date().toISOString(),
    })

    const vectorStore = await loadVectorStore()
    await vectorStore.addDocuments(documents)

    return NextResponse.json({
      chunksAdded: documents.length,
      source,
      filename: file.name,
      characters: text.length,
    })
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 },
    )
  }
}
