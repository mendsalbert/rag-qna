import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

import { EMBEDDING_MODEL } from '@/lib/constants'
import { getGoogleApiKey } from '@/lib/env'

function assertValidEmbeddings(embeddings: number[][], label: string) {
  const invalidIndex = embeddings.findIndex((vector) => vector.length === 0)

  if (invalidIndex !== -1) {
    throw new Error(
      `${label} returned an empty embedding at index ${invalidIndex}. ` +
        'Check GOOGLE_API_KEY and GEMINI_EMBEDDING_MODEL in .env.',
    )
  }
}

export function getEmbeddings() {
  const model = process.env.GEMINI_EMBEDDING_MODEL?.trim() || EMBEDDING_MODEL

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: getGoogleApiKey(),
    model,
  })

  return {
    async embedDocuments(documents: string[]) {
      const vectors = await embeddings.embedDocuments(documents)
      assertValidEmbeddings(vectors, `Gemini embeddings (${model})`)
      return vectors
    },
    async embedQuery(query: string) {
      const vector = await embeddings.embedQuery(query)
      if (vector.length === 0) {
        throw new Error(
          `Gemini embedQuery returned an empty vector. Check GOOGLE_API_KEY and GEMINI_EMBEDDING_MODEL in .env.`,
        )
      }
      return vector
    },
  }
}

export async function testEmbeddings() {
  const model = getEmbeddings()
  const vector = await model.embedQuery('health check')
  return vector.length
}
