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

async function loadSignalPulseHandlerWithDb(execute: ReturnType<typeof vi.fn>) {
  vi.resetModules()
  vi.doMock('../server/utils/turso', () => ({
    isMissingTursoConfigError: () => false,
    useTurso: () => ({ execute }),
  }))
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

  it('exposes a persisted daily conclusion with its selected evidence', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({
        rows: [{
          date: '2026-06-14',
          pulse_text: 'Legacy pulse fallback.',
          top_item_ids: '[1]',
          generated_at: '2026-06-14 12:00:00',
        }],
      })
      .mockResolvedValueOnce({
        rows: [{
          takeaway_json: '{"en":"AI tools are taking ownership of workflows.","zh":"AI 工具正在承担工作流。"}',
          evidence_item_ids: '[2,3]',
          source_item_ids: '[2,3]',
        }],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 2, source: 'web', url: 'https://example.com/2', title: 'Evidence 2' },
          { id: 3, source: 'github', url: 'https://example.com/3', title: 'Evidence 3' },
        ],
      })
    const handler = await loadSignalPulseHandlerWithDb(execute)

    await expect(handler()).resolves.toMatchObject({
      pulse: 'Legacy pulse fallback.',
      date: '2026-06-14',
      takeaway: {
        en: 'AI tools are taking ownership of workflows.',
        zh: 'AI 工具正在承担工作流。',
      },
      sourceItemIds: [2, 3],
      items: [
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 3 }),
      ],
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
