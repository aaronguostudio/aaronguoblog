export const DEFAULT_VOICE_AGENT_ORIGINS = [
  'https://aaronguo.com',
  'https://www.aaronguo.com',
  'https://aaronguostudio.com',
  'https://www.aaronguostudio.com',
  'http://localhost:6001',
  'http://127.0.0.1:6001',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function isAllowedVoiceOrigin(
  origin: string | undefined,
  configuredOrigins: string | undefined,
) {
  if (!origin) return true

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) return false

  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
  ) {
    return true
  }

  const configured = configuredOrigins
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  const allowedOrigins = [
    ...DEFAULT_VOICE_AGENT_ORIGINS,
    ...(configured || []),
    ...(vercelOrigin ? [vercelOrigin] : []),
  ]

  return allowedOrigins.some((allowedOrigin) => normalizeOrigin(allowedOrigin) === normalizedOrigin)
}
