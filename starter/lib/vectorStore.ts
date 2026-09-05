import { NeonPostgres } from '@langchain/community/vectorstores/neon'
// TODO (Step 1a): Uncomment this import when you implement embeddings
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

import { VECTOR_TABLE_NAME } from '@/lib/constants'
// TODO (Step 1a): Uncomment when wiring up the vector store
// import { getGoogleApiKey, getPostgresUrl } from '@/lib/env'

export { VECTOR_TABLE_NAME }

let vectorStorePromise: ReturnType<typeof NeonPostgres.initialize> | null = null

function createEmbeddingsClient() {
  // TODO (Step 1a): Create and return a GoogleGenerativeAIEmbeddings client
  //
  // return new GoogleGenerativeAIEmbeddings({
  //   apiKey: getGoogleApiKey(),
  //   model: process.env.GEMINI_EMBEDDING_MODEL?.trim() || EMBEDDING_MODEL,
  // })

  throw new Error('TODO Step 1a: Implement createEmbeddingsClient() — see README.md')
}

export default async function loadVectorStore() {
  // TODO (Step 1b): Initialize NeonPostgres and cache the promise
  //
  // if (!vectorStorePromise) {
  //   vectorStorePromise = NeonPostgres.initialize(createEmbeddingsClient(), {
  //     connectionString: getPostgresUrl(),
  //     tableName: VECTOR_TABLE_NAME,
  //   })
  // }
  // return vectorStorePromise

  throw new Error('TODO Step 1b: Implement loadVectorStore() — see README.md')
}

export function resetVectorStoreCache() {
  vectorStorePromise = null
}

// Reference when implementing createEmbeddingsClient():
// import { EMBEDDING_MODEL } from '@/lib/constants'
// model: process.env.GEMINI_EMBEDDING_MODEL?.trim() || EMBEDDING_MODEL
