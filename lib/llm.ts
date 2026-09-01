import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

import { CHAT_MODEL } from '@/lib/constants'
import { getGoogleApiKey } from '@/lib/env'

export function getChatModel() {
  return new ChatGoogleGenerativeAI({
    apiKey: getGoogleApiKey(),
    model: process.env.GEMINI_CHAT_MODEL?.trim() || CHAT_MODEL,
    temperature: 0.2,
  })
}
