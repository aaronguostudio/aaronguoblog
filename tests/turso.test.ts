import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMissingTursoConfigError, useTurso } from '../server/utils/turso'

type ApiHandler = (event?: unknown) => Promise<unknown>

async function loadSignalHandler(query: Record<string, string> = {}) {
  vi.resetModules()
  vi.doUnmock('../server/utils/turso')
  vi.stubGlobal('defineCachedEventHandler', (handler: ApiHandler) => handler)
  vi.stubGlobal('getQuery', () => query)

  const module = await import('../server/api/signal.get')
  return module.default as ApiHandler
}

async function loadSignalHandlerWithDb(
  execute: ReturnType<typeof vi.fn>,
  query: Record<string, string> = {}
) {
  vi.resetModules()
  vi.doMock('../server/utils/turso', () => ({
    isMissingTursoConfigError: () => false,
    useTurso: () => ({ execute }),
  }))
  vi.stubGlobal('defineCachedEventHandler', (handler: ApiHandler) => handler)
  vi.stubGlobal('getQuery', () => query)

  const module = await import('../server/api/signal.get')
  return module.default as ApiHandler
}

async function loadSignalPulseHandler() {
  vi.resetModules()
  vi.stubGlobal('defineCachedEventHandler', (handler: ApiHandler) => handler)

  const module = await import('../server/api/signal-pulse.get')
  return module.default as ApiHandler
}

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

describe('Signal API missing Turso fallbacks', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.doUnmock('../server/utils/turso')
    vi.resetModules()
  })

  it('returns an empty signal payload when Turso config is empty', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      tursoUrl: '',
      tursoAuthToken: '',
    }))

    const handler = await loadSignalHandler({ limit: '20', offset: '4', minRelevance: '7' })

    await expect(handler({})).resolves.toEqual({
      available: false,
      items: [],
      total: 0,
      stats: [],
      topics: [],
      latestRun: null,
      limit: 20,
      offset: 4,
    })
  })

  it('marks the Radar payload as available', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const handler = await loadSignalHandlerWithDb(execute)

    await expect(handler({})).resolves.toMatchObject({
      available: true,
      items: [],
      total: 0,
    })
  })

  it('marks the legacy fallback payload as available', async () => {
    const execute = vi.fn()
      .mockRejectedValueOnce(new Error('no such table: radar_items'))
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
    const handler = await loadSignalHandlerWithDb(execute)

    await expect(handler({})).resolves.toMatchObject({
      available: true,
      items: [],
      total: 0,
    })
  })

  it('returns an empty signal pulse payload when Turso config is missing', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({}))

    const handler = await loadSignalPulseHandler()

    await expect(handler()).resolves.toEqual({
      pulse: null,
      items: [],
      date: null,
    })
  })

  it('does not convert unclassified Turso errors into empty signal payloads', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      tursoUrl: 'not-a-valid-url',
      tursoAuthToken: 'token',
    }))

    const handler = await loadSignalHandler()

    await expect(handler({})).rejects.toThrow("The URL 'not-a-valid-url' is not in a valid format")
  })
})
