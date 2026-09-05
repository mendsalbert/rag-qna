import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
// TODO (Step 2): Uncomment these imports when building the retrieval chain
// import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
// import { createRetrievalChain } from 'langchain/chains/retrieval'
import type { BaseLanguageModel } from '@langchain/core/language_models/base'

import { RETRIEVAL_TOP_K } from '@/lib/constants'
import type loadVectorStore from '@/lib/vectorStore'

type CorpusVectorStore = Awaited<ReturnType<typeof loadVectorStore>>

const retrievalPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You answer questions using only the provided context from the user's knowledge base.
If the context does not contain enough information, say you do not have enough saved content to answer.
Be concise, accurate, and cite specific details from the context when possible.
Format answers as clean Markdown with short paragraphs and bullet lists when helpful.
Do not include stream metadata, JSON, or protocol prefixes in your reply.

Context:
{context}`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
])

export async function createRagChain(vectorStore: CorpusVectorStore, llm: BaseLanguageModel) {
  // TODO (Step 2): Build the LangChain retrieval chain
  //
  // 1. Create a retriever from the vector store:
  //    const retriever = vectorStore.asRetriever({
  //      k: RETRIEVAL_TOP_K,
  //      searchType: 'similarity',
  //    })
  //
  // 2. Create a document-combining chain:
  //    const combineDocsChain = await createStuffDocumentsChain({
  //      llm,
  //      prompt: retrievalPrompt,
  //    })
  //
  // 3. Return the full retrieval chain:
  //    return createRetrievalChain({ retriever, combineDocsChain })

  throw new Error('TODO Step 2: Implement createRagChain() — see README.md')
}
