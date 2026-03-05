import { useTurso } from '../utils/turso'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const source = (query.source as string) || ''
  const category = (query.category as string) || ''
  const minRelevance = parseInt((query.minRelevance as string) || '5')
  const limit = Math.min(parseInt((query.limit as string) || '50'), 100)
  const offset = parseInt((query.offset as string) || '0')
  const search = (query.q as string) || ''

  const db = useTurso()

  const where: string[] = ['relevance >= ?']
  const args: (string | number)[] = [minRelevance]

  if (source) { where.push('source = ?'); args.push(source) }
  if (category) { where.push('category = ?'); args.push(category) }
  if (search) { where.push('title LIKE ?'); args.push(`%${search}%`) }

  const result = await db.execute({
    sql: `SELECT id, source, url, title, summary, author, score, relevance, tags, category, created_at
          FROM items WHERE ${where.join(' AND ')}
          ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM items WHERE ${where.join(' AND ')}`,
    args,
  })

  // Stats
  const stats = await db.execute(
    `SELECT source, COUNT(*) as count FROM items WHERE relevance >= 5 GROUP BY source ORDER BY count DESC`
  )

  return {
    items: result.rows,
    total: countResult.rows[0]?.total || 0,
    stats: stats.rows,
    limit,
    offset,
  }
}, {
  maxAge: 300, // Cache for 5 minutes
  name: 'signal',
  getKey: (event) => {
    const q = getQuery(event)
    return `signal:${q.source || ''}:${q.category || ''}:${q.minRelevance || '5'}:${q.offset || '0'}:${q.q || ''}`
  },
})
