export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'

import { getCorpusStats, pingDatabase } from '@/lib/db'
import { getEnvStatus } from '@/lib/env'

export async function GET() {
  const env = getEnvStatus()

  if (!env.configured) {
    return NextResponse.json({
      status: 'needs_config',
      configured: false,
      missing: env.missing,
      chunkCount: 0,
      tableReady: false,
      sources: [],
      provider: env.provider,
    })
  }

  try {
    await pingDatabase()
    const stats = await getCorpusStats()

    return NextResponse.json({
      status: 'ok',
      configured: true,
      missing: [],
      provider: env.provider,
      ...stats,
    })
  } catch (error) {
    console.error('Stats route error:', error)
    return NextResponse.json(
      {
        status: 'error',
        configured: true,
        missing: [],
        provider: env.provider,
        chunkCount: 0,
        tableReady: false,
        sources: [],
        error: error instanceof Error ? error.message : 'Failed to load stats',
      },
      { status: 503 },
    )
  }
}
