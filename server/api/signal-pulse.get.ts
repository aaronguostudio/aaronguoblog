import { useTurso } from '../utils/turso'

export default defineCachedEventHandler(async () => {
  const db = useTurso()

  // Get today's pulse (or latest available)
  const pulseResult = await db.execute(
    `SELECT date, pulse_text, top_item_ids, generated_at 
     FROM daily_pulse 
     ORDER BY date DESC LIMIT 1`
  )

  const pulse = pulseResult.rows[0]
  if (!pulse) {
    return { pulse: null, items: [], date: null }
  }

  // Get the top items referenced by the pulse
  const topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
  
  let items: any[] = []
  if (topIds.length > 0) {
    const placeholders = topIds.map(() => '?').join(',')
    const itemsResult = await db.execute({
      sql: `SELECT id, source, url, title, ai_summary, relevance, category, score, created_at
            FROM items WHERE id IN (${placeholders})
            ORDER BY relevance DESC, score DESC`,
      args: topIds,
    })
    items = itemsResult.rows
  }

  return {
    pulse: pulse.pulse_text,
    date: pulse.date,
    generatedAt: pulse.generated_at,
    items,
  }
}, {
  maxAge: 600, // Cache for 10 minutes
  name: 'signal-pulse',
})
