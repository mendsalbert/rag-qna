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

    // TODO (Step 3): Same as /api/learn — index the extracted file chunks
    // await vectorStore.addDocuments(documents)
    void vectorStore

    return NextResponse.json(
      {
        error: 'Not implemented yet — complete Step 3 in README.md',
        chunksPrepared: documents.length,
        source,
        filename: file.name,
        characters: text.length,
        hint: 'Uncomment: await vectorStore.addDocuments(documents)',
      },
      { status: 501 },
    )
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 },
    )
  }
}
