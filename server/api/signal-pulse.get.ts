import { useTurso } from '../utils/turso'
import { isMissingRadarTableError } from '../utils/signal-radar'

type SignalPulseItem = Record<string, unknown>

export default defineCachedEventHandler(async () => {
  const db = useTurso()

  try {
    const pulseResult = await db.execute(
      `SELECT date, pulse_text, top_item_ids, generated_at
       FROM radar_daily_pulses
       ORDER BY date DESC LIMIT 1`
    )

    const pulse = pulseResult.rows[0]
    if (!pulse) {
      return { pulse: null, items: [], date: null }
    }

    const topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
    let items: SignalPulseItem[] = []

    if (topIds.length > 0) {
      const placeholders = topIds.map(() => '?').join(',')
      const itemsResult = await db.execute({
        sql: `SELECT
                ri.id, ri.source, ri.url, ri.title, ri.ai_summary,
                rit.relevance, rit.category, rit.score, rit.last_seen_at as created_at
              FROM radar_items ri
              JOIN radar_item_topics rit ON rit.item_id = ri.id
              WHERE ri.id IN (${placeholders})
              ORDER BY rit.relevance DESC, rit.score DESC`,
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
  } catch (error) {
    if (!isMissingRadarTableError(error)) throw error

    const pulseResult = await db.execute(
      `SELECT date, pulse_text, top_item_ids, generated_at
       FROM daily_pulse
       ORDER BY date DESC LIMIT 1`
    )

    const pulse = pulseResult.rows[0]
    if (!pulse) {
      return { pulse: null, items: [], date: null }
    }

    const topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
    let items: SignalPulseItem[] = []
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
  }
}, {
  maxAge: 600, // Cache for 10 minutes
  name: 'signal-pulse',
})
