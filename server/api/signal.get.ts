import { useTurso } from '../utils/turso'
import { buildSignalRadarWhere, isMissingRadarTableError, mapRadarItemRow } from '../utils/signal-radar'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const source = (query.source as string) || ''
  const category = (query.category as string) || ''
  const topic = (query.topic as string) || ''
  const minRelevance = parseInt((query.minRelevance as string) || '5')
  const limit = Math.min(parseInt((query.limit as string) || '50'), 100)
  const offset = parseInt((query.offset as string) || '0')
  const search = (query.q as string) || ''

  const db = useTurso()
  const where = buildSignalRadarWhere({ source, category, topic, minRelevance, search })

  try {
    const result = await db.execute({
      sql: `SELECT
              ri.id, ri.source, ri.url, ri.title, ri.summary, ri.ai_summary, ri.author,
              rit.score, rit.relevance, rit.category, rit.topic_slug, ri.created_at, rit.last_seen_at
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${where.sql.join(' AND ')}
            ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC
            LIMIT ? OFFSET ?`,
      args: [...where.args, limit, offset],
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${where.sql.join(' AND ')}`,
      args: where.args,
    })

    const stats = await db.execute(
      `SELECT ri.source, COUNT(*) as count
       FROM radar_items ri
       JOIN radar_item_topics rit ON rit.item_id = ri.id
       WHERE rit.relevance >= 5
       GROUP BY ri.source
       ORDER BY count DESC`
    )

    const topics = await db.execute(
      `SELECT slug, name, category
       FROM radar_topics
       WHERE visibility = 'public'
       ORDER BY name`
    )

    const latestRun = await db.execute(
      `SELECT id, status, started_at, completed_at
       FROM radar_runs
       ORDER BY started_at DESC
       LIMIT 1`
    )

    return {
      items: result.rows.map(mapRadarItemRow),
      total: countResult.rows[0]?.total || 0,
      stats: stats.rows,
      topics: topics.rows,
      latestRun: latestRun.rows[0] || null,
      limit,
      offset,
    }
  } catch (error) {
    if (!isMissingRadarTableError(error)) throw error

    const where: string[] = ['relevance >= ?']
    const args: (string | number)[] = [minRelevance]

    if (source) { where.push('source = ?'); args.push(source) }
    if (category) { where.push('category = ?'); args.push(category) }
    if (search) { where.push('title LIKE ?'); args.push(`%${search}%`) }

    const result = await db.execute({
      sql: `SELECT id, source, url, title, summary, ai_summary, author, score, relevance, tags, category, created_at
            FROM items WHERE ${where.join(' AND ')}
            ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM items WHERE ${where.join(' AND ')}`,
      args,
    })

    const stats = await db.execute(
      `SELECT source, COUNT(*) as count FROM items WHERE relevance >= 5 GROUP BY source ORDER BY count DESC`
    )

    return {
      items: result.rows,
      total: countResult.rows[0]?.total || 0,
      stats: stats.rows,
      topics: [],
      latestRun: null,
      limit,
      offset,
    }
  }
}, {
  maxAge: 300, // Cache for 5 minutes
  name: 'signal',
  getKey: (event) => {
    const q = getQuery(event)
    return `signal:${q.source || ''}:${q.category || ''}:${q.topic || ''}:${q.minRelevance || '5'}:${q.offset || '0'}:${q.q || ''}`
  },
})
