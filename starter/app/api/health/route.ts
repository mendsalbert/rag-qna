export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'

import { pingDatabase } from '@/lib/db'
import { getEnvStatus } from '@/lib/env'

export async function GET() {
  const env = getEnvStatus()

  if (!env.configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        missing: env.missing,
      },
      { status: 503 },
    )
  }

  try {
    const dbOk = await pingDatabase()
    return NextResponse.json({
      ok: dbOk,
      configured: true,
      provider: env.provider,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : 'Database unreachable',
      },
      { status: 503 },
    )
  }
}
