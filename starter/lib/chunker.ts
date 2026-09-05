import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
})

export async function chunkText(text: string, metadata: Record<string, unknown> = {}) {
  const docs = await splitter.createDocuments([text], [metadata])
  return docs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
      }),
  )
}
