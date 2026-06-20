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
