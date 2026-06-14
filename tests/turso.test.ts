import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMissingTursoConfigError, useTurso } from '../server/utils/turso'

describe('useTurso', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws a classified error when Turso config is missing', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      tursoUrl: '',
      tursoAuthToken: '',
    }))

    let error: unknown
    try {
      useTurso()
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('TURSO_URL and TURSO_AUTH_TOKEN are required')
    expect(isMissingTursoConfigError(error)).toBe(true)
  })
})
