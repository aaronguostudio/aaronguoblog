import { isMissingTursoConfigError, useTurso } from '../utils/turso'
import { buildPulseItemsQuery, isMissingRadarTableError } from '../utils/signal-radar'

type SignalPulseItem = Record<string, unknown>

function parseJson(value: unknown, fallback: unknown) {
  if (!value) return fallback
  try {
    return JSON.parse(String(value))
  } catch {
    return fallback
  }
}

export default defineCachedEventHandler(
  async () => {
    let db: ReturnType<typeof useTurso>
    try {
      db = useTurso()
    } catch (error) {
      if (!isMissingTursoConfigError(error)) throw error
      return { pulse: null, items: [], date: null }
    }

    try {
      const pulseResult = await db.execute(
        `SELECT date, pulse_text, top_item_ids, generated_at
       FROM radar_daily_pulses
       ORDER BY date DESC LIMIT 1`,
      )

      const pulse = pulseResult.rows[0]
      if (!pulse) {
        return { pulse: null, items: [], date: null }
      }

      let takeaway = null
      let topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
      let sourceItemIds: number[] = []
      try {
        const conclusionResult = await db.execute({
          sql: `SELECT takeaway_json, evidence_item_ids, source_item_ids
              FROM radar_daily_conclusions
              WHERE date = ? AND status = 'completed'
              LIMIT 1`,
          args: [pulse.date],
        })
        const conclusion = conclusionResult.rows[0]
        if (conclusion) {
          takeaway = parseJson(conclusion.takeaway_json, null)
          const evidenceItemIds = parseJson(conclusion.evidence_item_ids, [])
          if (Array.isArray(evidenceItemIds) && evidenceItemIds.length > 0) {
            topIds = evidenceItemIds.map((itemId) => Number(itemId)).filter(Number.isFinite)
          }
          const parsedSourceItemIds = parseJson(conclusion.source_item_ids, [])
          if (Array.isArray(parsedSourceItemIds)) {
            sourceItemIds = parsedSourceItemIds
              .map((itemId) => Number(itemId))
              .filter(Number.isFinite)
          }
        }
      } catch (error) {
        if (!isMissingRadarTableError(error)) throw error
      }
      let items: SignalPulseItem[] = []

      if (topIds.length > 0) {
        const itemsResult = await db.execute(buildPulseItemsQuery(topIds))
        items = itemsResult.rows
      }

      return {
        pulse: pulse.pulse_text,
        date: pulse.date,
        generatedAt: pulse.generated_at,
        takeaway,
        sourceItemIds,
        items,
      }
    } catch (error) {
      if (!isMissingRadarTableError(error)) throw error

      const pulseResult = await db.execute(
        `SELECT date, pulse_text, top_item_ids, generated_at
       FROM daily_pulse
       ORDER BY date DESC LIMIT 1`,
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
        takeaway: null,
        sourceItemIds: [],
        items,
      }
    }
  },
  {
    maxAge: 600, // Cache for 10 minutes
    name: 'signal-pulse',
  },
)
