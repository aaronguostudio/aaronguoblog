import { describe, expect, it, vi } from 'vitest'
import {
  deployedSnapshotMatches,
  signalHtmlContainsSnapshot,
  verifyDeployedRadarSnapshot,
} from '../../scripts/radar/deploy-verifier.js'

describe('Radar deploy verifier', () => {
  it.each([
    ['2026-10-31', 'Current Signal read · Oct 31, 2026', true],
    ['2026-11-01', 'Current Signal read · Nov 1, 2026', true],
    ['2026-11-01', '2026-11-01', true],
    ['2026-10-31', 'Oct 30, 2026', false],
    ['2026-11-01', '2026年11月1日', true],
  ])('matches date %s against %s: %s', (date, text, matches) => {
    expect(signalHtmlContainsSnapshot(`<p>${text}</p>`, { date })).toBe(matches)
  })

  it.each([true, false])('requires matching JSON with display-date HTML (match=%s)', async (matches) => {
    const expectedSnapshot = { date: '2026-11-01', generatedAt: '2026-11-01T14:00:00Z' }
    const logger = { log: vi.fn() }
    const fetchImpl = vi.fn(async (url) => ({
      ok: true,
      text: async () => url.endsWith('/radar/latest.json')
        ? JSON.stringify({ ...expectedSnapshot, generatedAt: matches ? expectedSnapshot.generatedAt : 'old' })
        : '<p>Current Signal read · Nov 1, 2026</p>',
    }))
    const verification = verifyDeployedRadarSnapshot({
      siteUrl: 'https://example.test',
      expectedSnapshot,
      fetchImpl,
      attempts: 1,
      delayMs: 0,
      logger,
    })

    if (matches) {
      await expect(verification).resolves.toMatchObject({ ok: true })
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('en-US'))
    } else {
      await expect(verification).rejects.toThrow('remote JSON match: false')
    }
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('matches remote snapshots by date and generatedAt', () => {
    const expected = {
      date: '2026-06-18',
      generatedAt: '2026-06-18T13:32:57.614Z',
    }

    expect(deployedSnapshotMatches(expected, {
      date: '2026-06-18',
      generatedAt: '2026-06-18T13:32:57.614Z',
    })).toBe(true)
    expect(deployedSnapshotMatches(expected, {
      date: '2026-06-18',
      generatedAt: '2026-06-18T13:30:00.000Z',
    })).toBe(false)
  })

  it('confirms the prerendered Signal page includes the snapshot date', () => {
    const snapshot = {
      date: '2026-06-18',
      pulse: {
        date: '2026-06-18',
      },
    }

    expect(signalHtmlContainsSnapshot('<main>2026-06-18</main>', snapshot)).toBe(true)
    expect(signalHtmlContainsSnapshot('<main>2026-04-07</main>', snapshot)).toBe(false)
  })
})
