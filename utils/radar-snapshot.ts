type RadarSnapshotLike = {
  date?: string | null
  generatedAt?: string | null
  pulse?: {
    date?: string | null
    generatedAt?: string | null
  } | null
  latestRun?: {
    startedAt?: string | null
    completedAt?: string | null
  } | null
}

type PulseSelectableItem = {
  id?: string | number | null
}

export type RadarTakeaway = {
  en?: string | null
  zh?: string | null
}

type RadarItemSortable = {
  id?: string | number | null
  lastSeenAt?: string | null
  last_seen_at?: string | null
  createdAt?: string | null
  created_at?: string | null
  publishedAt?: string | null
  published_at?: string | null
  relevance?: string | number | null
  score?: string | number | null
}

function parseRadarDate(value: string | null | undefined) {
  if (!value) return Number.NEGATIVE_INFINITY

  const trimmed = value.trim()
  if (!trimmed) return Number.NEGATIVE_INFINITY

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00Z`
    : /(?:Z|[+-]\d{2}:?\d{2})$/.test(trimmed)
      ? trimmed
      : `${trimmed.replace(' ', 'T')}Z`

  const time = Date.parse(normalized)
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}

export function getRadarSnapshotTimestamp(snapshot: RadarSnapshotLike | null | undefined) {
  if (!snapshot) return Number.NEGATIVE_INFINITY

  const candidates = [
    snapshot.generatedAt,
    snapshot.latestRun?.completedAt,
    snapshot.pulse?.generatedAt,
    snapshot.latestRun?.startedAt,
    snapshot.pulse?.date,
    snapshot.date,
  ]

  for (const candidate of candidates) {
    const time = parseRadarDate(candidate)
    if (Number.isFinite(time)) return time
  }

  return Number.NEGATIVE_INFINITY
}

export function isNewerRadarSnapshot(
  candidate: RadarSnapshotLike | null | undefined,
  current: RadarSnapshotLike | null | undefined,
) {
  return getRadarSnapshotTimestamp(candidate) > getRadarSnapshotTimestamp(current)
}

export function selectPulseSnapshotItems<T extends PulseSelectableItem>(
  items: T[],
  topItemIds: Array<string | number> = [],
  limit = 3,
) {
  if (topItemIds.length === 0) return items.slice(0, limit)

  const byId = new Map(items.map((item) => [String(item.id), item]))
  const matchedItems = topItemIds
    .map((id) => byId.get(String(id)))
    .filter((item): item is T => Boolean(item))
    .slice(0, limit)

  return matchedItems.length > 0 ? matchedItems : items.slice(0, limit)
}

export function extractRadarPulseThemes(text: string | null | undefined) {
  const match = text?.match(/(?:^|\.\s*)Top themes:\s*(.+?)\.?\s*$/is)
  return match?.[1]?.trim() || null
}

export function selectRadarTakeaway(
  takeaway: RadarTakeaway | null | undefined,
  locale: string | null | undefined,
) {
  const preferred = locale?.toLowerCase().startsWith('zh') ? takeaway?.zh : takeaway?.en
  const fallback = locale?.toLowerCase().startsWith('zh') ? takeaway?.en : takeaway?.zh
  return preferred?.trim() || fallback?.trim() || null
}

function itemTimestamp(item: RadarItemSortable) {
  return parseRadarDate(
    item.lastSeenAt ||
      item.last_seen_at ||
      item.createdAt ||
      item.created_at ||
      item.publishedAt ||
      item.published_at,
  )
}

function itemNumber(value: string | number | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function sortRadarItemsByDateDesc<T extends RadarItemSortable>(items: T[]) {
  return [...items].sort((a, b) => {
    const timeDiff = itemTimestamp(b) - itemTimestamp(a)
    if (timeDiff !== 0) return timeDiff

    const relevanceDiff = itemNumber(b.relevance) - itemNumber(a.relevance)
    if (relevanceDiff !== 0) return relevanceDiff

    const scoreDiff = itemNumber(b.score) - itemNumber(a.score)
    if (scoreDiff !== 0) return scoreDiff

    return String(b.id || '').localeCompare(String(a.id || ''), undefined, { numeric: true })
  })
}
