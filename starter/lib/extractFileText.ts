const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.json',
  '.html',
  '.htm',
  '.xml',
  '.yaml',
  '.yml',
  '.log',
  '.rtf',
])

const MAX_FILE_BYTES = 10 * 1024 * 1024

function getExtension(filename: string) {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot).toLowerCase()
}

export function getAcceptedFileTypes() {
  return '.txt,.md,.markdown,.csv,.json,.html,.htm,.xml,.yaml,.yml,.log,.pdf'
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File is too large. Maximum size is 10 MB.')
  }

  const extension = getExtension(file.name)

  if (TEXT_EXTENSIONS.has(extension)) {
    const text = await file.text()
    if (!text.trim()) {
      throw new Error('The file appears to be empty.')
    }
    return text
  }

  if (extension === '.pdf' || file.type === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse')
    const data = new Uint8Array(await file.arrayBuffer())
    const parser = new PDFParse({ data })

    try {
      const result = await parser.getText()
      const text = result.text.trim()

      if (!text) {
        throw new Error('No text could be extracted from this PDF.')
      }

      return text
    } finally {
      await parser.destroy()
    }
  }

  throw new Error(`Unsupported file type: ${extension || file.type || 'unknown'}`)
}
