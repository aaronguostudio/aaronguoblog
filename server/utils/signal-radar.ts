type FilterInput = {
  source?: string
  category?: string
  topic?: string
  minRelevance: number
  search?: string
}

type RadarRow = Record<string, unknown>

export function buildSignalRadarWhere(input: FilterInput) {
  const sql: string[] = ['rit.relevance >= ?']
  const args: (string | number)[] = [input.minRelevance]

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
