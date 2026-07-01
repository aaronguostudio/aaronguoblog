import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@libsql/client'
import { describe, expect, it } from 'vitest'
import {
  buildRadarSnapshot,
  validateRadarSnapshot,
  writeRadarSnapshot,
} from '../../scripts/radar/static-export.js'
import {
  createRadarRun,
  finishRadarRun,
  migrateRadarSchema,
  upsertRadarItems,
  upsertRadarPulse,
  upsertRadarTopic,
} from '../../scripts/radar/repository.js'

function createMemoryClient() {
  return createClient({ url: 'file::memory:' })
}

function createTopic(overrides = {}) {
  return {
    slug: 'coding-agents',
    name: 'Coding Agents',
    query: 'coding agents',
    category: 'coding',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 6,
    sourceHints: { subreddits: ['ClaudeAI'] },
    ...overrides,
  }
}

function createItem(overrides = {}) {
  return {
    canonicalUrl: 'https://example.com/guardian-runtime',
    source: 'hackernews',
    sourceItemId: 'hn-1',
    url: 'https://example.com/guardian-runtime',
    title: 'Guardian Runtime for AI coding agents',
    summary: 'Local firewall for AI coding agents.',
    aiSummary: 'A relevant coding-agent safety signal.',
    author: null,
    score: 74,
    relevance: 9,
    category: 'coding',
    topicSlug: 'coding-agents',
    clusterId: 'cluster-1',
    clusterTitle: 'Coding agent safety',
    publishedAt: '2026-06-14',
    raw: { providerRuntime: { rerankModel: 'gpt-4.1-mini' } },
    ...overrides,
  }
}

async function createSnapshotClient({
  fallbackSummary = false,
  includeFallbackItem = false,
  sourceErrors = {},
  warnings = [],
} = {}) {
  const client = createMemoryClient()
  await migrateRadarSchema(client)
  await upsertRadarTopic(client, createTopic())
  const runId = await createRadarRun(client, {
    topicSlug: 'coding-agents',
    mode: 'quick',
    lookbackDays: 30,
    cadence: 'daily',
  })
  const items = [
    createItem({
      aiSummary: fallbackSummary
        ? 'fallback-local-score (entity-miss demotion)'
        : 'A relevant coding-agent safety signal.',
    }),
  ]
  if (includeFallbackItem) {
    items.push(
      createItem({
        canonicalUrl: 'https://example.com/fallback-agent',
        sourceItemId: 'hn-2',
        url: 'https://example.com/fallback-agent',
        title: 'Fallback-ranked coding agent mention',
        aiSummary: 'fallback-local-score (entity-miss demotion)',
      }),
    )
  }
  const ids = await upsertRadarItems(client, {
    runId,
    items,
  })
  await upsertRadarPulse(client, {
    runId,
    pulse: {
      date: '2026-06-14',
      pulseText: 'Coding agents produced one high-signal safety item.',
      topItemIds: ids.slice(0, 1),
    },
  })
  await finishRadarRun(client, {
    runId,
    status: Object.keys(sourceErrors).length || warnings.length ? 'completed_with_warnings' : 'completed',
    itemsSeen: 1,
    itemsWritten: 1,
    warnings,
    sourceErrors,
  })
  return client
}

describe('static Radar export', () => {
  it('builds an SSG-friendly snapshot from Radar tables', async () => {
    const client = await createSnapshotClient()

    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
      limit: 10,
    })

    expect(snapshot).toMatchObject({
      version: 1,
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
      quality: {
        status: 'ok',
        blockers: [],
        warnings: [],
      },
      pulse: {
        text: 'Coding agents produced one high-signal safety item.',
        date: '2026-06-14',
      },
      latestRun: {
        status: 'completed',
      },
      topics: [
        {
          slug: 'coding-agents',
          name: 'Coding Agents',
          category: 'coding',
          cadence: 'daily',
          mode: 'quick',
        },
      ],
      stats: [
        {
          source: 'hackernews',
          count: 1,
        },
      ],
    })
    expect(snapshot.items).toEqual([
      expect.objectContaining({
        source: 'hackernews',
        title: 'Guardian Runtime for AI coding agents',
        topicSlug: 'coding-agents',
        category: 'coding',
        relevance: 9,
        score: 74,
        publishedAt: '2026-06-14',
      }),
    ])
  })

  it('filters local fallback ranking from default snapshots', async () => {
    const client = await createSnapshotClient({ includeFallbackItem: true })

    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
      limit: 10,
    })

    expect(snapshot.quality).toEqual({
      status: 'ok',
      blockers: [],
      warnings: [],
    })
    expect(snapshot.items).toHaveLength(1)
    expect(snapshot.items[0].title).toBe('Guardian Runtime for AI coding agents')
  })

  it('keeps pulse top items in the static snapshot even when they fall outside the recency limit', async () => {
    const client = createMemoryClient()
    await migrateRadarSchema(client)
    await upsertRadarTopic(client, createTopic())
    const runId = await createRadarRun(client, {
      topicSlug: 'coding-agents',
      mode: 'quick',
      lookbackDays: 30,
      cadence: 'daily',
    })
    const [pulseItemId, recentItemId] = await upsertRadarItems(client, {
      runId,
      items: [
        createItem({
          canonicalUrl: 'https://example.com/pulse-agent',
          sourceItemId: 'hn-pulse',
          url: 'https://example.com/pulse-agent',
          title: 'Pulse-selected coding agent signal',
        }),
        createItem({
          canonicalUrl: 'https://example.com/recent-agent',
          sourceItemId: 'hn-recent',
          url: 'https://example.com/recent-agent',
          title: 'Recent coding agent signal',
        }),
      ],
    })

    await client.execute({
      sql: 'UPDATE radar_item_topics SET last_seen_at = ? WHERE item_id = ?',
      args: ['2026-06-13 10:00:00', pulseItemId],
    })
    await client.execute({
      sql: 'UPDATE radar_item_topics SET last_seen_at = ? WHERE item_id = ?',
      args: ['2026-06-14 10:00:00', recentItemId],
    })
    await upsertRadarPulse(client, {
      runId,
      pulse: {
        date: '2026-06-14',
        pulseText: 'The older item is still the editorial pulse pick.',
        topItemIds: [pulseItemId],
      },
    })
    await finishRadarRun(client, {
      runId,
      status: 'completed',
      itemsSeen: 2,
      itemsWritten: 2,
    })

    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
      limit: 1,
    })

    expect(snapshot.quality.status).toBe('ok')
    expect(snapshot.items.map(item => item.id)).toEqual([recentItemId, pulseItemId])
  })

  it('blocks snapshots whose pulse references items missing from the exported item list', () => {
    const snapshot = {
      latestRun: { status: 'completed', sourceErrors: {}, warnings: [] },
      pulse: { topItemIds: [123] },
      items: [{ id: 456, aiSummary: 'A normal summary.' }],
    }

    expect(validateRadarSnapshot(snapshot)).toEqual({
      status: 'blocked',
      blockers: ['Pulse top item ids are missing from snapshot items: 123.'],
      warnings: [],
    })
  })

  it('filters local fallback ranking unless explicitly allowed', async () => {
    const client = await createSnapshotClient({ fallbackSummary: true })
    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
    })

    expect(validateRadarSnapshot(snapshot)).toEqual({
      status: 'blocked',
      blockers: ['Snapshot has no publishable Radar items.'],
      warnings: [],
    })

    const allowedSnapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
      allowLocalRanking: true,
    })

    expect(validateRadarSnapshot(allowedSnapshot, { allowLocalRanking: true })).toEqual({
      status: 'ok',
      blockers: [],
      warnings: ['Snapshot contains fallback local-score summaries.'],
    })
  })

  it('publishes partial snapshots when a non-critical source fails', async () => {
    const client = await createSnapshotClient({
      sourceErrors: { x: 'HTTP 400: Bad Request' },
      warnings: ['Some sources failed: x'],
    })
    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
    })

    expect(validateRadarSnapshot(snapshot)).toMatchObject({
      status: 'ok',
      blockers: [],
      warnings: expect.arrayContaining([
        'Some sources failed: x',
        'Source x failed: HTTP 400: Bad Request',
      ]),
    })
  })

  it('writes latest and dated snapshot files', async () => {
    const client = await createSnapshotClient()
    const snapshot = await buildRadarSnapshot(client, {
      date: '2026-06-14',
      generatedAt: '2026-06-14T15:00:00.000Z',
    })
    const outputDir = mkdtempSync(join(tmpdir(), 'radar-static-'))

    try {
      const result = await writeRadarSnapshot(snapshot, { outputDir })

      expect(result).toEqual({
        latestPath: join(outputDir, 'latest.json'),
        datedPath: join(outputDir, 'daily', '2026-06-14.json'),
      })
      expect(JSON.parse(readFileSync(result.latestPath, 'utf8'))).toMatchObject({
        version: 1,
        date: '2026-06-14',
        items: [expect.objectContaining({ topicSlug: 'coding-agents' })],
      })
      expect(JSON.parse(readFileSync(result.datedPath, 'utf8'))).toMatchObject({
        version: 1,
        date: '2026-06-14',
      })
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })
})
