type FilterInput = {
  source?: string
  category?: string
  topic?: string
  minRelevance: number
  search?: string
}

type RadarRow = Record<string, unknown>

type QueryArg = string | number

function joinWhere(whereSql: string[]) {
  return whereSql.join(' AND ')
}

export function buildSignalRadarWhere(input: FilterInput) {
  const sql: string[] = ['rit.relevance >= ?']
  const args: QueryArg[] = [input.minRelevance]

  if (input.source) {
    sql.push('ri.source = ?')
    args.push(input.source)
  }
  if (input.category) {
    sql.push('rit.category = ?')
    args.push(input.category)
  }
  if (input.topic) {
    sql.push('rit.topic_slug = ?')
    args.push(input.topic)
  }
  if (input.search) {
    sql.push('ri.title LIKE ?')
    args.push(`%${input.search}%`)
  }

  return { sql, args }
}

export function buildRadarItemsSql(whereSql: string[]) {
  return `WITH ranked_items AS (
            SELECT
              ri.id, ri.source, ri.url, ri.title, ri.summary, ri.ai_summary, ri.author,
              rit.score, rit.relevance, rit.category, rit.topic_slug, ri.created_at, rit.last_seen_at,
              ROW_NUMBER() OVER (PARTITION BY ri.id ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC, rit.topic_slug ASC) AS rn
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${joinWhere(whereSql)}
          )
          SELECT
            ranked.id, ranked.source, ranked.url, ranked.title, ranked.summary, ranked.ai_summary, ranked.author,
            ranked.score, ranked.relevance, ranked.category, ranked.topic_slug, ranked.created_at, ranked.last_seen_at
          FROM ranked_items ranked
          WHERE ranked.rn = 1
          ORDER BY ranked.last_seen_at DESC, ranked.relevance DESC, ranked.score DESC
          LIMIT ? OFFSET ?`
}

export function buildRadarItemsQuery(whereSql: string[], args: QueryArg[], limit: number, offset: number) {
  return {
    sql: buildRadarItemsSql(whereSql),
    args: [...args, limit, offset],
  }
}

export function buildRadarCountSql(whereSql: string[]) {
  return `WITH ranked_items AS (
            SELECT
              ri.id,
              ROW_NUMBER() OVER (PARTITION BY ri.id ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC, rit.topic_slug ASC) AS rn
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${joinWhere(whereSql)}
          )
          SELECT COUNT(*) as total
          FROM ranked_items ranked
          WHERE ranked.rn = 1`
}

export function buildRadarCountQuery(whereSql: string[], args: QueryArg[]) {
  return {
    sql: buildRadarCountSql(whereSql),
    args,
  }
}

export function buildRadarStatsSql() {
  return `SELECT ri.source, COUNT(DISTINCT ri.id) as count
          FROM radar_items ri
          JOIN radar_item_topics rit ON rit.item_id = ri.id
          WHERE rit.relevance >= 5
          GROUP BY ri.source
          ORDER BY count DESC`
}

export function buildPulseItemsQuery(topIds: number[]) {
  const values = topIds.map(() => '(?, ?)').join(', ')

  return {
    sql: `WITH pulse_ids(id, position) AS (VALUES ${values}),
            ranked_items AS (
              SELECT
                ri.id, ri.source, ri.url, ri.title, ri.ai_summary,
                rit.relevance, rit.category, rit.score, rit.last_seen_at as created_at,
                pulse_ids.position,
                ROW_NUMBER() OVER (PARTITION BY ri.id ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC, rit.topic_slug ASC) AS rn
              FROM pulse_ids
              JOIN radar_items ri ON ri.id = pulse_ids.id
              JOIN radar_item_topics rit ON rit.item_id = ri.id
            )
            SELECT
              ranked.id, ranked.source, ranked.url, ranked.title, ranked.ai_summary,
              ranked.relevance, ranked.category, ranked.score, ranked.created_at
            FROM ranked_items ranked
            WHERE ranked.rn = 1
            ORDER BY ranked.position`,
    args: topIds.flatMap((id, position) => [id, position]),
  }
}

export function mapRadarItemRow(row: RadarRow) {
  return {
    id: row.id,
    source: row.source,
    url: row.url,
    title: row.title,
    summary: row.summary,
    ai_summary: row.ai_summary,
    author: row.author,
    score: row.score,
    relevance: row.relevance,
    category: row.category,
    topic_slug: row.topic_slug,
    created_at: row.last_seen_at || row.created_at,
  }
}

export function isMissingRadarTableError(error: unknown) {
  return error instanceof Error && /no such table: radar_/i.test(error.message)
}
