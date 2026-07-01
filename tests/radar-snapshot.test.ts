import { describe, expect, it } from 'vitest'
import {
  getRadarSnapshotTimestamp,
  isNewerRadarSnapshot,
  selectPulseSnapshotItems,
  sortRadarItemsByDateDesc,
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

describe('pulse snapshot item selection', () => {
  it('falls back to leading snapshot items when pulse ids are missing', () => {
    const items = [
      { id: 1, title: 'First fallback item' },
      { id: 2, title: 'Second fallback item' },
      { id: 3, title: 'Third fallback item' },
      { id: 4, title: 'Fourth fallback item' },
    ]

    expect(selectPulseSnapshotItems(items, [999], 3)).toEqual(items.slice(0, 3))
  })

  it('preserves pulse id order when matching items exist', () => {
    const items = [
      { id: 1, title: 'First item' },
      { id: 2, title: 'Second item' },
      { id: 3, title: 'Third item' },
    ]

    expect(selectPulseSnapshotItems(items, [3, 1], 3)).toEqual([items[2], items[0]])
  })
})

describe('radar item recency sorting', () => {
  it('orders items from newest displayed timestamp to oldest', () => {
    const items = [
      { id: 1, title: 'two days old', created_at: '2026-06-28 14:32:34' },
      { id: 2, title: 'four days old', created_at: '2026-06-27 13:33:04' },
      { id: 3, title: 'one day old', created_at: '2026-06-29 14:37:13' },
    ]

    expect(sortRadarItemsByDateDesc(items).map((item) => item.id)).toEqual([3, 1, 2])
  })
})
