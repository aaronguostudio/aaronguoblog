import { isMissingTursoConfigError, useTurso } from '../utils/turso'
import {
  buildRadarCountQuery,
  buildRadarItemsQuery,
  buildRadarStatsSql,
  buildSignalRadarWhere,
  isMissingRadarTableError,
  mapRadarItemRow,
} from '../utils/signal-radar'

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)
    const source = (query.source as string) || ''
    const category = (query.category as string) || ''
    const topic = (query.topic as string) || ''
    const minRelevance = parseInt((query.minRelevance as string) || '5')
    const limit = Math.min(parseInt((query.limit as string) || '50'), 100)
    const offset = parseInt((query.offset as string) || '0')
    const search = (query.q as string) || ''

    let db: ReturnType<typeof useTurso>
    try {
      db = useTurso()
    } catch (error) {
      if (!isMissingTursoConfigError(error)) throw error
      return {
        available: false,
        items: [],
        total: 0,
        stats: [],
        topics: [],
        latestRun: null,
        limit,
        offset,
      }
    }

    const where = buildSignalRadarWhere({ source, category, topic, minRelevance, search })

    try {
      const result = await db.execute(buildRadarItemsQuery(where.sql, where.args, limit, offset))

      const countResult = await db.execute(buildRadarCountQuery(where.sql, where.args))

      const stats = await db.execute(buildRadarStatsSql())

      const topics = await db.execute(
        `SELECT slug, name, category
       FROM radar_topics
       WHERE visibility = 'public'
       ORDER BY name`,
      )

      const latestRun = await db.execute(
        `SELECT id, status, started_at, completed_at
       FROM radar_runs
       ORDER BY started_at DESC
       LIMIT 1`,
      )

      return {
        available: true,
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

      if (source) {
        where.push('source = ?')
        args.push(source)
      }
      if (category) {
        where.push('category = ?')
        args.push(category)
      }
      if (search) {
        where.push('title LIKE ?')
        args.push(`%${search}%`)
      }

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
        `SELECT source, COUNT(*) as count FROM items WHERE relevance >= 5 GROUP BY source ORDER BY count DESC`,
      )

      return {
        available: true,
        items: result.rows,
        total: countResult.rows[0]?.total || 0,
        stats: stats.rows,
        topics: [],
        latestRun: null,
        limit,
        offset,
      }
    }
  },
  {
    maxAge: 300, // Cache for 5 minutes
    name: 'signal',
    getKey: (event) => {
      const q = getQuery(event)
      return `signal:${q.source || ''}:${q.category || ''}:${q.topic || ''}:${q.minRelevance || '5'}:${q.limit || '50'}:${q.offset || '0'}:${q.q || ''}`
    },
  },
)
