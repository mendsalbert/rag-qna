const REQUIRED = ['POSTGRES_URL', 'GOOGLE_API_KEY'] as const

const PLACEHOLDER_PATTERNS = [/\.\.\./, /^AIza\.\.\.$/i, /^sk-\.\.\.$/i, /^your-/i]

export type EnvStatus = {
  configured: boolean
  missing: string[]
  provider: 'gemini'
}

function isPlaceholder(value: string) {
  const trimmed = value.trim()
  if (trimmed.length < 20) {
    return true
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function getGoogleKeyValue() {
  return process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || ''
}

export function getEnvStatus(): EnvStatus {
  const googleKey = getGoogleKeyValue()
  const missing = [
    ...REQUIRED.filter((key) => key !== 'GOOGLE_API_KEY' && !process.env[key]?.trim()),
    ...(!googleKey || isPlaceholder(googleKey) ? ['GOOGLE_API_KEY'] : []),
  ]

  return {
    configured: missing.length === 0,
    missing,
    provider: 'gemini',
  }
}

export function requireEnv() {
  const status = getEnvStatus()
  if (!status.configured) {
    if (status.missing.includes('GOOGLE_API_KEY') && getGoogleKeyValue()) {
      throw new Error(
        'GOOGLE_API_KEY looks like a placeholder. Add a real Gemini key from https://aistudio.google.com/apikey',
      )
    }

    throw new Error(`Missing environment variables: ${status.missing.join(', ')}`)
  }
}

export function getPostgresUrl() {
  const url = process.env.POSTGRES_URL?.trim()
  if (!url) {
    throw new Error('POSTGRES_URL is not set. Add your Neon connection string to .env')
  }
  return url
}

export function getGoogleApiKey() {
  const key = getGoogleKeyValue()
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not set. Add your Gemini API key to .env')
  }

  if (isPlaceholder(key)) {
    throw new Error(
      'GOOGLE_API_KEY looks like a placeholder. Add a real Gemini key from https://aistudio.google.com/apikey',
    )
  }

  return key
}
