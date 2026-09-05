import { neon } from '@neondatabase/serverless'

import { VECTOR_TABLE_NAME } from '@/lib/constants'
import { getPostgresUrl } from '@/lib/env'

export function getSql() {
  return neon(getPostgresUrl())
}

export async function pingDatabase() {
  const sql = getSql()
  const [row] = await sql`SELECT 1 AS ok`
  return row?.ok === 1
}

export async function tableExists() {
  const sql = getSql()
  const rows = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${VECTOR_TABLE_NAME}
    ) AS exists
  `
  return Boolean(rows[0]?.exists)
}

export async function getCorpusStats() {
  const sql = getSql()
  const exists = await tableExists()

  if (!exists) {
    return {
      chunkCount: 0,
      tableReady: false,
      sources: [] as string[],
    }
  }

  const [countRow] = await sql(`SELECT COUNT(*)::int AS count FROM ${VECTOR_TABLE_NAME}`)
  const sourceRows = await sql(`
    SELECT DISTINCT metadata->>'source' AS source
    FROM ${VECTOR_TABLE_NAME}
    WHERE metadata->>'source' IS NOT NULL
    ORDER BY source
    LIMIT 20
  `)

  return {
    chunkCount: countRow?.count ?? 0,
    tableReady: true,
    sources: sourceRows.map((row) => String(row.source)).filter(Boolean),
  }
}

export async function clearCorpus() {
  const sql = getSql()
  const exists = await tableExists()

  if (!exists) {
    return { deleted: 0 }
  }

  const [row] = await sql(`
    WITH deleted AS (
      DELETE FROM ${VECTOR_TABLE_NAME}
      RETURNING 1
    )
    SELECT COUNT(*)::int AS count FROM deleted
  `)

  return { deleted: row?.count ?? 0 }
}
