import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRadarClient } from './repository.js'

const SNAPSHOT_VERSION = 1
const DEFAULT_OUTPUT_DIR = 'public/radar'
const DEFAULT_LIMIT = 100
const DEFAULT_MIN_RELEVANCE = 5

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function parseJson(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(String(value))
  } catch {
    return fallback
  }
}

function mapTopic(row) {
  return {
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    cadence: String(row.cadence),
    mode: String(row.mode),
  }
}

function mapLatestRun(row) {
  if (!row) return null
  const parsedWarnings = parseJson(row.warning_json, [])
  const parsedSourceErrors = parseJson(row.source_error_json, {})

  return {
    id: Number(row.id),
    status: String(row.status),
    startedAt: row.started_at || null,
    completedAt: row.completed_at || null,
    warnings: Array.isArray(parsedWarnings) ? parsedWarnings : Object.values(parsedWarnings),
    sourceErrors:
      parsedSourceErrors &&
      typeof parsedSourceErrors === 'object' &&
      !Array.isArray(parsedSourceErrors)
        ? parsedSourceErrors
        : {},
  }
}

function mapPulse(row) {
  if (!row) return null
  return {
    text: String(row.pulse_text || ''),
    date: row.date || null,
    generatedAt: row.generated_at || null,
    topItemIds: parseJson(row.top_item_ids, []),
  }
}

function mapStat(row) {
  return {
    source: String(row.source),
    count: Number(row.count),
  }
}

function mapItem(row) {
  return {
    id: Number(row.id),
    source: String(row.source),
    url: String(row.url),
    title: String(row.title),
    summary: row.summary || '',
    aiSummary: row.ai_summary || '',
    author: row.author || null,
    score: Number(row.score || 0),
    relevance: Number(row.relevance || 0),
    category: String(row.category),
    topicSlug: String(row.topic_slug),
    createdAt: row.last_seen_at || row.created_at || null,
    publishedAt: row.published_at || null,
  }
}

function hasFallbackLocalScore(snapshot) {
  return snapshot.items.some((item) => /fallback-local-score/i.test(item.aiSummary || ''))
}

function fallbackFilterSql({ allowLocalRanking }) {
  return allowLocalRanking
    ? ''
    : "AND LOWER(COALESCE(ri.ai_summary, '')) NOT LIKE '%fallback-local-score%'"
}

export function validateRadarSnapshot(snapshot, { allowLocalRanking = false } = {}) {
  const blockers = []
  const warnings = []

  if (!snapshot.latestRun) {
    blockers.push('Snapshot has no Radar run metadata.')
  } else if (snapshot.latestRun.status === 'failed') {
    blockers.push('Latest Radar run failed.')
  }

  if (!snapshot.items.length) {
    blockers.push('Snapshot has no publishable Radar items.')
  }

  const sourceErrorCount = Object.keys(snapshot.latestRun?.sourceErrors || {}).length
  if (sourceErrorCount > 0) {
    for (const [source, message] of Object.entries(snapshot.latestRun.sourceErrors)) {
      warnings.push(`Source ${source} failed: ${message}`)
    }
  }

  if (hasFallbackLocalScore(snapshot)) {
    const message = 'Snapshot contains fallback local-score summaries.'
    if (allowLocalRanking) warnings.push(message)
    else blockers.push(message)
  }

  for (const warning of snapshot.latestRun?.warnings || []) {
    warnings.push(String(warning))
  }

  return {
    status: blockers.length > 0 ? 'blocked' : 'ok',
    blockers,
    warnings,
  }
}

export async function buildRadarSnapshot(
  client,
  {
    date = todayIso(),
    generatedAt = new Date().toISOString(),
    limit = DEFAULT_LIMIT,
    minRelevance = DEFAULT_MIN_RELEVANCE,
    allowLocalRanking = false,
  } = {},
) {
  const fallbackFilter = fallbackFilterSql({ allowLocalRanking })
  const [topics, latestRun, pulse, stats, items] = await Promise.all([
    client.execute(
      `SELECT slug, name, category, cadence, mode
       FROM radar_topics
       WHERE visibility = 'public'
       ORDER BY name`,
    ),
    client.execute(
      `SELECT id, status, started_at, completed_at, warning_json, source_error_json
       FROM radar_runs
       ORDER BY started_at DESC, id DESC
       LIMIT 1`,
    ),
    client.execute(
      `SELECT date, pulse_text, top_item_ids, generated_at
       FROM radar_daily_pulses
       ORDER BY date DESC
       LIMIT 1`,
    ),
    client.execute(
      `SELECT ri.source, COUNT(DISTINCT ri.id) as count
       FROM radar_items ri
       JOIN radar_item_topics rit ON rit.item_id = ri.id
       WHERE rit.relevance >= ?
       ${fallbackFilter}
       GROUP BY ri.source
       ORDER BY count DESC`,
      [minRelevance],
    ),
    client.execute({
      sql: `WITH ranked_items AS (
              SELECT
                ri.id, ri.source, ri.url, ri.title, ri.summary, ri.ai_summary, ri.author,
                ri.published_at, ri.created_at,
                rit.score, rit.relevance, rit.category, rit.topic_slug, rit.last_seen_at,
                ROW_NUMBER() OVER (
                  PARTITION BY ri.id
                  ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC, rit.topic_slug ASC
                ) AS rn
              FROM radar_items ri
              JOIN radar_item_topics rit ON rit.item_id = ri.id
              WHERE rit.relevance >= ?
              ${fallbackFilter}
            )
            SELECT
              id, source, url, title, summary, ai_summary, author, published_at, created_at,
              score, relevance, category, topic_slug, last_seen_at
            FROM ranked_items
            WHERE rn = 1
            ORDER BY last_seen_at DESC, relevance DESC, score DESC
            LIMIT ?`,
      args: [minRelevance, limit],
    }),
  ])

  const snapshot = {
    version: SNAPSHOT_VERSION,
    date,
    generatedAt,
    quality: {
      status: 'ok',
      blockers: [],
      warnings: [],
    },
    latestRun: mapLatestRun(latestRun.rows[0]),
    pulse: mapPulse(pulse.rows[0]),
    topics: topics.rows.map(mapTopic),
    stats: stats.rows.map(mapStat),
    items: items.rows.map(mapItem),
  }
  snapshot.quality = validateRadarSnapshot(snapshot, { allowLocalRanking })

  return snapshot
}

export async function writeRadarSnapshot(
  snapshot,
  { outputDir = DEFAULT_OUTPUT_DIR, allowBlocked = false } = {},
) {
  if (!allowBlocked && snapshot.quality.status === 'blocked') {
    throw new Error(`Radar snapshot blocked: ${snapshot.quality.blockers.join('; ')}`)
  }

  const dailyDir = join(outputDir, 'daily')
  mkdirSync(dailyDir, { recursive: true })

  const latestPath = join(outputDir, 'latest.json')
  const datedPath = join(dailyDir, `${snapshot.date}.json`)
  const body = `${JSON.stringify(snapshot, null, 2)}\n`

  writeFileSync(latestPath, body)
  writeFileSync(datedPath, body)

  return { latestPath, datedPath }
}

export async function exportRadarSnapshot({
  client = createRadarClient(),
  outputDir = DEFAULT_OUTPUT_DIR,
  allowLocalRanking = false,
  allowBlocked = false,
  ...snapshotOptions
} = {}) {
  const snapshot = await buildRadarSnapshot(client, {
    ...snapshotOptions,
    allowLocalRanking,
  })
  const paths = await writeRadarSnapshot(snapshot, { outputDir, allowBlocked })

  return { snapshot, ...paths }
}
