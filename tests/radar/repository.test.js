import { createClient } from '@libsql/client'
import { describe, expect, it } from 'vitest'
import {
  buildTopicRow,
  createRadarRun,
  discoverSchema,
  finishRadarRun,
  migrateRadarSchema,
  upsertRadarTopic,
  upsertRadarItems,
} from '../../scripts/radar/repository.js'

function createFakeClient() {
  const calls = []
  return {
    calls,
    async execute(input) {
      calls.push(input)
      const sql = typeof input === 'string' ? input : input.sql
      if (sql.includes('INSERT INTO radar_runs')) return { lastInsertRowid: 42, rows: [] }
      if (sql.includes('SELECT id FROM radar_items')) return { rows: [{ id: 7 }] }
      return { rows: [] }
    },
  }
}

function createMemoryClient() {
  return createClient({ url: 'file::memory:' })
}

function createTopic(overrides = {}) {
  return {
    slug: 'mobile-ai',
    name: 'Mobile AI',
    query: 'mobile AI',
    category: 'ai',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: { subreddits: ['LocalLLaMA'] },
    ...overrides,
  }
}

function createItem(overrides = {}) {
  return {
    canonicalUrl: 'https://example.com/a',
    source: 'reddit',
    sourceItemId: 'reddit-1',
    url: 'https://example.com/a?utm_source=x',
    title: 'A',
    summary: 'Summary',
    aiSummary: 'AI summary',
    author: 'author',
    score: 100,
    relevance: 8,
    category: 'ai',
    topicSlug: 'mobile-ai',
    clusterId: 'c1',
    clusterTitle: 'Cluster',
    publishedAt: '2026-06-14T00:00:00Z',
    raw: { ok: true },
    ...overrides,
  }
}

async function createMigratedClient() {
  const client = createMemoryClient()
  await migrateRadarSchema(client)
  await upsertRadarTopic(client, createTopic())
  return client
}

async function fetchTopicMembership(client) {
  const result = await client.execute(`
    SELECT sighting_count, latest_run_id, score, relevance
    FROM radar_item_topics
    WHERE topic_slug = 'mobile-ai'
  `)

  return result.rows[0]
}

describe('radar repository', () => {
  it('builds topic rows with serialized source hints', () => {
    const row = buildTopicRow({
      slug: 'mobile-ai',
      name: 'Mobile AI',
      query: 'mobile AI',
      category: 'ai',
      cadence: 'daily',
      mode: 'quick',
      lookbackDays: 30,
      visibility: 'public',
      minRelevance: 5,
      sourceHints: { subreddits: ['LocalLLaMA'] },
    })

    expect(row).toEqual([
      'mobile-ai',
      'Mobile AI',
      'mobile AI',
      'ai',
      'daily',
      'quick',
      30,
      'public',
      5,
      '{"subreddits":["LocalLLaMA"]}',
    ])
  })

  it('creates a run and returns its id', async () => {
    const client = createFakeClient()
    await expect(createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })).resolves.toBe(42)
    expect(client.calls[0].sql).toContain('INSERT INTO radar_runs')
  })

  it('upserts items and topic membership', async () => {
    const client = createFakeClient()
    const ids = await upsertRadarItems(client, {
      runId: 42,
      items: [{
        canonicalUrl: 'https://example.com/a',
        source: 'reddit',
        sourceItemId: 'reddit-1',
        url: 'https://example.com/a?utm_source=x',
        title: 'A',
        summary: 'Summary',
        aiSummary: 'AI summary',
        author: 'author',
        score: 100,
        relevance: 8,
        category: 'ai',
        topicSlug: 'mobile-ai',
        clusterId: 'c1',
        clusterTitle: 'Cluster',
        publishedAt: '2026-06-14T00:00:00Z',
        raw: { ok: true },
      }],
    })

    expect(ids).toEqual([7])
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_items'))).toBe(true)
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_item_topics'))).toBe(true)
  })

  it('migrates and discovers schema for hyphenated table names', async () => {
    const client = createMemoryClient()
    await migrateRadarSchema(client)
    await client.execute('CREATE TABLE "legacy-items" (id INTEGER PRIMARY KEY, title TEXT)')

    const schema = await discoverSchema(client)

    expect(schema).toContainEqual({
      table: 'legacy-items',
      columns: ['id', 'title'],
    })
    expect(schema).toContainEqual(expect.objectContaining({
      table: 'radar_items',
      columns: expect.arrayContaining(['id', 'canonical_url', 'source']),
    }))
  })

  it('keeps duplicate same-run item upserts idempotent', async () => {
    const client = await createMigratedClient()
    const runId = await createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })

    await upsertRadarItems(client, { runId, items: [createItem()] })
    await upsertRadarItems(client, { runId, items: [createItem()] })

    const membership = await fetchTopicMembership(client)
    expect(membership.sighting_count).toBe(1)
    expect(membership.latest_run_id).toBe(runId)
  })

  it('increments later-run sightings while preserving max score and relevance', async () => {
    const client = await createMigratedClient()
    const firstRunId = await createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })
    const laterRunId = await createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })

    await upsertRadarItems(client, { runId: firstRunId, items: [createItem({ score: 100, relevance: 8 })] })
    await upsertRadarItems(client, { runId: laterRunId, items: [createItem({ score: 50, relevance: 3 })] })

    let membership = await fetchTopicMembership(client)
    expect(membership.sighting_count).toBe(2)
    expect(membership.latest_run_id).toBe(laterRunId)
    expect(membership.score).toBe(100)
    expect(membership.relevance).toBe(8)

    await upsertRadarItems(client, { runId: firstRunId, items: [createItem({ score: 75, relevance: 5 })] })

    membership = await fetchTopicMembership(client)
    expect(membership.sighting_count).toBe(3)
    expect(membership.latest_run_id).toBe(laterRunId)
    expect(membership.score).toBe(100)
    expect(membership.relevance).toBe(8)
  })

  it('finishes a run with status and item counts', async () => {
    const client = await createMigratedClient()
    const runId = await createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })

    await finishRadarRun(client, {
      runId,
      status: 'completed',
      itemsSeen: 12,
      itemsWritten: 5,
    })

    const result = await client.execute({
      sql: 'SELECT status, items_seen, items_written FROM radar_runs WHERE id = ?',
      args: [runId],
    })
    expect(result.rows[0]).toMatchObject({
      status: 'completed',
      items_seen: 12,
      items_written: 5,
    })
  })
})
