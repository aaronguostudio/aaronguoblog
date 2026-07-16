import { describe, expect, it } from 'vitest'

import { getVoiceErrorDiagnostic } from '../utils/voice-error'

function namedError(name: string, message = '') {
  const error = new Error(message)
  error.name = name
  return error
}

describe('getVoiceErrorDiagnostic', () => {
  it('classifies denied microphone permission', () => {
    expect(getVoiceErrorDiagnostic(namedError('NotAllowedError'))).toEqual({
      kind: 'permission',
      name: 'NotAllowedError',
      status: undefined,
    })
  })

  it.each(['NotFoundError', 'NotReadableError', 'AbortError', 'OverconstrainedError'])(
    'classifies %s as a microphone problem',
    (name) => {
      expect(getVoiceErrorDiagnostic(namedError(name)).kind).toBe('microphone')
    },
  )

  it('classifies unsupported browsers without exposing the raw message', () => {
    expect(
      getVoiceErrorDiagnostic(new Error('Microphone access is not supported in this browser.')),
    ).toEqual({ kind: 'unsupported', name: 'Error', status: undefined })
  })

  it.each([403, 429, 502, 503, 504])('classifies HTTP %s as service availability', (status) => {
    expect(getVoiceErrorDiagnostic({ statusCode: status }).kind).toBe('service')
  })

  it('reads nested fetch response status codes', () => {
    expect(getVoiceErrorDiagnostic({ response: { status: 503 } }).status).toBe(503)
  })

  it('classifies network failures separately', () => {
    expect(getVoiceErrorDiagnostic(namedError('TypeError', 'Failed to fetch')).kind).toBe(
      'connection',
    )
  })

  it('uses a safe service fallback for unknown failures', () => {
    expect(getVoiceErrorDiagnostic(new Error('Unexpected provider response')).kind).toBe('service')
  })
})
