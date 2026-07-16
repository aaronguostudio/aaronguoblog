export type VoiceErrorKind = 'permission' | 'microphone' | 'unsupported' | 'connection' | 'service'

export type VoiceErrorDiagnostic = {
  kind: VoiceErrorKind
  name?: string
  status?: number
}

type ErrorLike = {
  message?: unknown
  name?: unknown
  status?: unknown
  statusCode?: unknown
  response?: {
    status?: unknown
  }
}

function numericStatus(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function getVoiceErrorDiagnostic(error: unknown): VoiceErrorDiagnostic {
  const details =
    typeof error === 'object' && error !== null ? (error as ErrorLike) : ({} as ErrorLike)
  const name = typeof details.name === 'string' ? details.name : undefined
  const message = typeof details.message === 'string' ? details.message.toLowerCase() : ''
  const status =
    numericStatus(details.statusCode) ||
    numericStatus(details.status) ||
    numericStatus(details.response?.status)

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return { kind: 'permission', name, status }
  }

  if (
    name === 'NotFoundError' ||
    name === 'NotReadableError' ||
    name === 'AbortError' ||
    name === 'OverconstrainedError'
  ) {
    return { kind: 'microphone', name, status }
  }

  if (message.includes('microphone access is not supported')) {
    return { kind: 'unsupported', name, status }
  }

  if (status === 403 || status === 429 || (status !== undefined && status >= 500)) {
    return { kind: 'service', name, status }
  }

  if (
    name === 'TypeError' ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('offline')
  ) {
    return { kind: 'connection', name, status }
  }

  return { kind: 'service', name, status }
}
