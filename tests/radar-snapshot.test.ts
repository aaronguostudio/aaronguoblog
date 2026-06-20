import { describe, expect, it } from 'vitest'
import {
  getRadarSnapshotTimestamp,
  isNewerRadarSnapshot,
} from '../utils/radar-snapshot'

describe('radar snapshot freshness', () => {
  it('uses generatedAt as the strongest freshness timestamp', () => {
    expect(getRadarSnapshotTimestamp({
      date: '2026-06-14',
      generatedAt: '2026-06-18T13:32:57.614Z',
      pulse: {
        date: '2026-06-17',
        generatedAt: '2026-06-17 08:00:00',
      },
      latestRun: {
        completedAt: '2026-06-16 08:00:00',
      },
    })).toBe(Date.parse('2026-06-18T13:32:57.614Z'))
  })

  it('detects when a fetched snapshot is newer than the prerendered snapshot', () => {
    const prerendered = {
      generatedAt: '2026-04-07T12:00:00.000Z',
      items: [{ id: 1 }],
    }
    const fetched = {
      generatedAt: '2026-06-18T13:32:57.614Z',
      items: [{ id: 2 }],
    }

    expect(isNewerRadarSnapshot(fetched, prerendered)).toBe(true)
    expect(isNewerRadarSnapshot(prerendered, fetched)).toBe(false)
  })
})
