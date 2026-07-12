import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@libsql/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function createRadarClient(env = process.env) {
  if (!env.TURSO_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required for Radar storage')
  }

  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}

export function getRadarSchemaSql() {
  return readFileSync(join(__dirname, 'schema.sql'), 'utf8')
}

export async function discoverSchema(client) {
  const tables = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)

  const result = []
  for (const row of tables.rows) {
    const columns = await client.execute({
      sql: 'SELECT name FROM pragma_table_info(?)',
      args: [row.name],
    })
    result.push({
      table: row.name,
      columns: columns.rows.map((column) => column.name),
    })
  }

  return result
}

export async function migrateRadarSchema(client) {
  const statements = getRadarSchemaSql()
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await client.execute(`${statement};`)
  }
}

export function buildTopicRow(topic) {
  return [
    topic.slug,
    topic.name,
    topic.query,
    topic.category,
    topic.cadence,
    topic.mode,
    topic.lookbackDays,
    topic.visibility,
    topic.minRelevance,
    JSON.stringify(topic.sourceHints || {}),
  ]
}

export async function upsertRadarTopic(client, topic) {
  await client.execute({
    sql: `INSERT INTO radar_topics
      (slug, name, query, category, cadence, mode, lookback_days, visibility, min_relevance, source_hints_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        query = excluded.query,
        category = excluded.category,
        cadence = excluded.cadence,
        mode = excluded.mode,
        lookback_days = excluded.lookback_days,
        visibility = excluded.visibility,
        min_relevance = excluded.min_relevance,
        source_hints_json = excluded.source_hints_json,
        updated_at = datetime('now')`,
    args: buildTopicRow(topic),
  })
}

export async function createRadarRun(client, { topicSlug, mode, lookbackDays, cadence = null }) {
  const result = await client.execute({
    sql: `INSERT INTO radar_runs (status, topic_slug, mode, lookback_days, cadence)
          VALUES ('running', ?, ?, ?, ?)`,
    args: [topicSlug, mode, lookbackDays, cadence],
  })

  return Number(result.lastInsertRowid)
}

export async function getDeepReadCandidates(client, { topics, maxTopics = 1 }) {
  const candidates = []

  for (const topic of topics) {
    const settings = topic.deepRead
    if (!settings?.enabled || !topic.threadSlug) continue

    const result = await client.execute({
      sql: `SELECT
              ri.canonical_url,
              ri.url,
              ri.source,
              ri.title,
              ri.summary,
              ri.ai_summary,
              ri.published_at,
              rit.score,
              rit.relevance,
              rit.sighting_count,
              rit.last_seen_at
            FROM radar_item_topics rit
            JOIN radar_items ri ON ri.id = rit.item_id
            WHERE rit.topic_slug = ?
              AND rit.relevance >= ?
              AND LOWER(COALESCE(ri.ai_summary, '')) NOT LIKE '%fallback-local-score%'
            ORDER BY rit.sighting_count DESC, rit.relevance DESC, rit.score DESC,
              rit.last_seen_at DESC, ri.id DESC
            LIMIT ?`,
      args: [topic.slug, topic.minRelevance, settings.itemLimit || 10],
    })

    const items = result.rows.map((row) => ({
      canonicalUrl: String(row.canonical_url || row.url),
      url: String(row.url),
      source: String(row.source || 'web'),
      title: String(row.title || ''),
      summary: String(row.summary || ''),
      aiSummary: String(row.ai_summary || ''),
      publishedAt: row.published_at || null,
      score: Number(row.score || 0),
      relevance: Number(row.relevance || 0),
      sightingCount: Number(row.sighting_count || 1),
      lastSeenAt: row.last_seen_at || null,
    }))

    const repeatedItems = items.filter(
      (item) => item.sightingCount >= (settings.minSightingCount || 2),
    )
    const enoughSources = items.length >= (settings.minSources || 3)
    const importantEnough =
      topic.cadence === 'weekly' || repeatedItems.length >= (settings.minRepeatedSources || 2)

    if (!enoughSources || !importantEnough) continue

    candidates.push({
      topic,
      items,
      importance:
        repeatedItems.length * 100 + Math.max(...items.map((item) => item.sightingCount), 0) * 5,
      repeatedSources: repeatedItems.length,
    })
  }

  return candidates
    .sort((left, right) => right.importance - left.importance)
    .slice(0, Math.max(1, maxTopics))
}

export async function findDeepReadByFingerprint(client, inputFingerprint) {
  const result = await client.execute({
    sql: `SELECT id, topic_slug, thread_slug, read_at, status
          FROM radar_deep_reads
          WHERE input_fingerprint = ?
          LIMIT 1`,
    args: [inputFingerprint],
  })

  return result.rows[0] || null
}

export async function insertRadarDeepRead(
  client,
  {
    topicSlug,
    threadSlug,
    readAt,
    inputFingerprint,
    title,
    question,
    synthesis,
    caveat,
    sources,
    model,
  },
) {
  const result = await client.execute({
    sql: `INSERT INTO radar_deep_reads
      (topic_slug, thread_slug, read_at, status, input_fingerprint, title_json,
       question_json, synthesis_json, caveat_json, sources_json, source_count, model)
      VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(input_fingerprint) DO UPDATE SET
        topic_slug = excluded.topic_slug,
        thread_slug = excluded.thread_slug,
        read_at = excluded.read_at,
        status = excluded.status,
        title_json = excluded.title_json,
        question_json = excluded.question_json,
        synthesis_json = excluded.synthesis_json,
        caveat_json = excluded.caveat_json,
        sources_json = excluded.sources_json,
        source_count = excluded.source_count,
        model = excluded.model,
        updated_at = datetime('now')`,
    args: [
      topicSlug,
      threadSlug,
      readAt,
      inputFingerprint,
      JSON.stringify(title),
      JSON.stringify(question),
      JSON.stringify(synthesis),
      JSON.stringify(caveat),
      JSON.stringify(sources),
      sources.length,
      model || null,
    ],
  })

  return Number(result.lastInsertRowid || 0)
}

export async function finishRadarRun(
  client,
  { runId, status, itemsSeen, itemsWritten, warnings = {}, sourceErrors = {}, errorMessage = null },
) {
  await client.execute({
    sql: `UPDATE radar_runs SET
            completed_at = datetime('now'),
            status = ?,
            items_seen = ?,
            items_written = ?,
            warning_json = ?,
            source_error_json = ?,
            error_message = ?
          WHERE id = ?`,
    args: [
      status,
      itemsSeen,
      itemsWritten,
      JSON.stringify(warnings),
      JSON.stringify(sourceErrors),
      errorMessage,
      runId,
    ],
  })
}

export async function upsertRadarItems(client, { runId, items }) {
  const ids = []

  for (const item of items) {
    await client.execute({
      sql: `INSERT INTO radar_items
        (canonical_url, source, source_item_id, url, title, summary, ai_summary, author, published_at, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(canonical_url) DO UPDATE SET
          source = excluded.source,
          source_item_id = excluded.source_item_id,
          url = excluded.url,
          title = excluded.title,
          summary = excluded.summary,
          ai_summary = excluded.ai_summary,
          author = excluded.author,
          published_at = excluded.published_at,
          raw_json = excluded.raw_json,
          updated_at = datetime('now')`,
      args: [
        item.canonicalUrl,
        item.source,
        item.sourceItemId || null,
        item.url,
        item.title,
        item.summary || '',
        item.aiSummary || '',
        item.author || null,
        item.publishedAt || null,
        JSON.stringify(item.raw || {}),
      ],
    })

    const selected = await client.execute({
      sql: 'SELECT id FROM radar_items WHERE canonical_url = ?',
      args: [item.canonicalUrl],
    })
    const itemId = Number(selected.rows[0].id)
    ids.push(itemId)

    await client.execute({
      sql: `INSERT INTO radar_item_topics
        (item_id, topic_slug, category, score, relevance, cluster_id, cluster_title, latest_run_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_id, topic_slug) DO UPDATE SET
          category = excluded.category,
          score = MAX(radar_item_topics.score, excluded.score),
          relevance = MAX(radar_item_topics.relevance, excluded.relevance),
          cluster_id = excluded.cluster_id,
          cluster_title = excluded.cluster_title,
          last_seen_at = datetime('now'),
          sighting_count = CASE
            WHEN radar_item_topics.latest_run_id IS excluded.latest_run_id
              THEN radar_item_topics.sighting_count
            ELSE radar_item_topics.sighting_count + 1
          END,
          latest_run_id = CASE
            WHEN radar_item_topics.latest_run_id IS NULL
              OR excluded.latest_run_id > radar_item_topics.latest_run_id
              THEN excluded.latest_run_id
            ELSE radar_item_topics.latest_run_id
          END`,
      args: [
        itemId,
        item.topicSlug,
        item.category,
        item.score,
        item.relevance,
        item.clusterId || null,
        item.clusterTitle || null,
        runId,
      ],
    })
  }

  return ids
}

export async function upsertRadarPulse(client, { runId, pulse }) {
  await client.execute({
    sql: `INSERT INTO radar_daily_pulses (date, pulse_text, top_item_ids, run_id)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(date) DO UPDATE SET
            pulse_text = excluded.pulse_text,
            top_item_ids = excluded.top_item_ids,
            generated_at = datetime('now'),
            run_id = excluded.run_id`,
    args: [pulse.date, pulse.pulseText, JSON.stringify(pulse.topItemIds), runId],
  })
}
