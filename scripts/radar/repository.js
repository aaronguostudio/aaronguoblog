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
      columns: columns.rows.map(column => column.name),
    })
  }

  return result
}

export async function migrateRadarSchema(client) {
  const statements = getRadarSchemaSql()
    .split(';')
    .map(statement => statement.trim())
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

export async function finishRadarRun(client, { runId, status, itemsSeen, itemsWritten, warnings = {}, sourceErrors = {}, errorMessage = null }) {
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
