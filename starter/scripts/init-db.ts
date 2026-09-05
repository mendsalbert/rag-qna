import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

import { VECTOR_TABLE_NAME } from '../lib/constants'

async function initDatabase() {
  const connectionString = process.env.POSTGRES_URL?.trim()

  if (!connectionString) {
    throw new Error('POSTGRES_URL is missing. Copy .env.example to .env and add your Neon connection string.')
  }

  console.log('Initializing Neon database...')
  const sql = neon(connectionString)

  await sql`CREATE EXTENSION IF NOT EXISTS vector`
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

  await sql(`
    CREATE TABLE IF NOT EXISTS ${VECTOR_TABLE_NAME} (
      id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
      text text,
      metadata jsonb,
      embedding vector
    )
  `)

  const [row] = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${VECTOR_TABLE_NAME}
    ) AS ready
  `

  console.log(`Database ready. Table "${VECTOR_TABLE_NAME}" exists: ${row?.ready}`)
  console.log('Next steps:')
  console.log('  1. Add GOOGLE_API_KEY to .env')
  console.log('  2. npm run seed   (optional sample data)')
  console.log('  3. npm run dev')
}

initDatabase().catch((error) => {
  console.error(error)
  process.exit(1)
})
