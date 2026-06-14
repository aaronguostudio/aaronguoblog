import latestRadarSnapshot from '~/public/radar/latest.json'

export type StaticRadarItem = {
  id: number | string
  source: string
  url: string
  title: string
  summary?: string | null
  aiSummary?: string | null
  score?: number | string | null
  relevance?: number | string
  category: string
  topicSlug?: string
  createdAt?: string | null
  publishedAt?: string | null
}

export type StaticRadarStat = {
  source: string
  count: number | string
}

export type StaticRadarTopic = {
  slug: string
  name: string
  category?: string
}

export type StaticRadarSnapshot = {
  version?: number
  date?: string
  generatedAt?: string
  pulse?: {
    text?: string | null
    date?: string | null
    topItemIds?: Array<number | string>
  } | null
  items?: StaticRadarItem[]
  stats?: StaticRadarStat[]
  topics?: StaticRadarTopic[]
  latestRun?: {
    completedAt?: string | null
    startedAt?: string | null
  } | null
}

function readStaticRadarSnapshotFile() {
  const snapshot = latestRadarSnapshot as StaticRadarSnapshot
  return snapshot?.items?.length ? snapshot : null
}

async function fetchStaticRadarSnapshot() {
  try {
    return await $fetch<StaticRadarSnapshot>('/radar/latest.json')
  } catch {
    return null
  }
}

export function useStaticRadarSnapshot(
  key = 'radar-latest',
  options: { immediate?: boolean } = {},
) {
  return useAsyncData<StaticRadarSnapshot | null>(
    key,
    async () => {
      const fileSnapshot = await readStaticRadarSnapshotFile()
      if (fileSnapshot) return fileSnapshot
      return await fetchStaticRadarSnapshot()
    },
    {
      default: () => null,
      immediate: options.immediate ?? true,
      server: true,
    },
  )
}
