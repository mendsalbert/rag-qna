export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'

import { clearCorpus } from '@/lib/db'
import { requireEnv } from '@/lib/env'
import { resetVectorStoreCache } from '@/lib/vectorStore'

export async function DELETE() {
  try {
    requireEnv()
    const result = await clearCorpus()
    resetVectorStoreCache()

    return NextResponse.json({
      deleted: result.deleted,
    })
  } catch (error) {
    console.error('Clear corpus error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear corpus' },
      { status: 500 },
    )
  }
}
