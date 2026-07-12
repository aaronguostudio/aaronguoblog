import type { H3Event } from 'h3'

const TOKEN_ENDPOINT = 'https://api.x.ai/v1/realtime/client_secrets'
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 8

type RateLimitEntry = {
  count: number
  resetAt: number
}

type XaiClientSecretResponse = {
  value?: string
  token?: string
  client_secret?: string | { value?: string }
  expires_at?: number
}

const rateLimits = new Map<string, RateLimitEntry>()

function getClientIp(event: H3Event) {
  const forwardedFor = getRequestHeader(event, 'x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || getRequestHeader(event, 'x-real-ip') || 'unknown'
}

function isAllowedOrigin(origin: string | undefined, configuredOrigins: string | undefined) {
  if (!origin) return true

  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true
  }

  const defaultOrigins = [
    'https://aaronguo.com',
    'https://www.aaronguo.com',
    'http://localhost:6001',
    'http://127.0.0.1:6001',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]
  const configured = configuredOrigins
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return [...defaultOrigins, ...(configured || [])].includes(origin)
}

function consumeRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateLimits.get(ip)

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false

  entry.count += 1
  return true
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')

  const config = useRuntimeConfig(event)
  const origin = getRequestHeader(event, 'origin')

  if (!isAllowedOrigin(origin, config.voiceAgentAllowedOrigins)) {
    throw createError({ statusCode: 403, statusMessage: 'Voice session origin is not allowed' })
  }

  if (!consumeRateLimit(getClientIp(event))) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many voice sessions requested. Please try again later.',
    })
  }

  if (!config.xaiApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Voice assistant is not configured' })
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.xaiApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      expires_after: { seconds: 300 },
    }),
  })

  const payload = (await response.json().catch(() => null)) as XaiClientSecretResponse | null

  if (!response.ok) {
    console.error('xAI voice token request failed', { status: response.status })
    throw createError({ statusCode: 502, statusMessage: 'Unable to start the voice assistant' })
  }

  const nestedSecret =
    typeof payload?.client_secret === 'object'
      ? payload.client_secret.value
      : payload?.client_secret
  const token = payload?.value || payload?.token || nestedSecret

  if (!token) {
    console.error('xAI voice token response did not contain a token')
    throw createError({ statusCode: 502, statusMessage: 'Unable to start the voice assistant' })
  }

  return {
    token,
    agentId: config.xaiAgentId,
    expiresAt: payload?.expires_at ?? null,
  }
})
