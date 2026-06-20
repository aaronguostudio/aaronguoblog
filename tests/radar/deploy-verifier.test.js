import { describe, expect, it } from 'vitest'
import {
  deployedSnapshotMatches,
  signalHtmlContainsSnapshot,
} from '../../scripts/radar/deploy-verifier.js'

describe('Radar deploy verifier', () => {
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
