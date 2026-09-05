/** Strip leaked Vercel AI SDK stream protocol from assistant messages. */
export function sanitizeAssistantContent(content: string): string {
  if (!content.includes('0:"')) {
    return content.trim()
  }

  const parts: string[] = []
  const regex = /0:"((?:\\.|[^"\\])*)"/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    try {
      parts.push(JSON.parse(`"${match[1]}"`))
    } catch {
      parts.push(match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'))
    }
  }

  if (parts.length > 0) {
    return parts.join('').trim()
  }

  return content
    .replace(/0:"/g, '')
    .replace(/"\n?/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .trim()
}
