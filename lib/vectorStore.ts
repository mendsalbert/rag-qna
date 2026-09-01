import { NeonPostgres } from '@langchain/community/vectorstores/neon'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

import { EMBEDDING_MODEL, VECTOR_TABLE_NAME } from '@/lib/constants'
import { getGoogleApiKey, getPostgresUrl } from '@/lib/env'

export { VECTOR_TABLE_NAME }

let vectorStorePromise: ReturnType<typeof NeonPostgres.initialize> | null = null

function createEmbeddingsClient() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: getGoogleApiKey(),
    model: process.env.GEMINI_EMBEDDING_MODEL?.trim() || EMBEDDING_MODEL,
  })
}

export default async function loadVectorStore() {
  if (!vectorStorePromise) {
    vectorStorePromise = NeonPostgres.initialize(createEmbeddingsClient(), {
      connectionString: getPostgresUrl(),
      tableName: VECTOR_TABLE_NAME,
    })
  }

  return vectorStorePromise
}

export function resetVectorStoreCache() {
  vectorStorePromise = null
}
