import 'dotenv/config'

import { chunkText } from '../lib/chunker'
import { testEmbeddings } from '../lib/embeddings'
import { requireEnv } from '../lib/env'
import loadVectorStore from '../lib/vectorStore'

const SAMPLE_KNOWLEDGE = `
Neon is a serverless Postgres platform designed for modern applications and AI workloads.

Key Neon features:
- Serverless Postgres with autoscaling compute and scale-to-zero
- Branching for database environments (dev, staging, preview)
- Built-in connection pooling
- pgvector extension for vector similarity search and RAG applications

pgvector in Neon:
- Stores embedding vectors directly in Postgres
- Supports cosine distance, L2 distance, and inner product search
- Works with LangChain vector store integrations for retrieval-augmented generation

LangChain RAG flow in this app:
1. Ingest: user text is split into chunks with RecursiveCharacterTextSplitter
2. Embed: Gemini gemini-embedding-001 generates 3072-dimension vectors
3. Store: NeonPostgres vector store persists chunks + embeddings in Neon
4. Retrieve: user questions are embedded and matched via similarity search
5. Generate: LangChain retrieval chain streams grounded answers from Gemini
`.trim()

async function seed() {
  requireEnv()

  console.log('Checking Gemini embeddings...')
  const dimensions = await testEmbeddings()
  console.log(`Gemini embeddings OK (${dimensions} dimensions).`)

  console.log('Seeding sample knowledge into Neon...')
  const documents = await chunkText(SAMPLE_KNOWLEDGE, {
    source: 'seed-script',
    ingestedAt: new Date().toISOString(),
  })

  const vectorStore = await loadVectorStore()
  await vectorStore.addDocuments(documents)

  console.log(`Done. Added ${documents.length} chunks to the vector store.`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
