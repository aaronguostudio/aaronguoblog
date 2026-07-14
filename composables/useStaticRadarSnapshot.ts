import latestRadarSnapshot from '~/public/radar/latest.json'
import type { SignalDeepRead } from '~/data/signal/threads'
import { isNewerRadarSnapshot } from '~/utils/radar-snapshot'
import type { RadarTakeaway } from '~/utils/radar-snapshot'

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

export type StaticRadarDeepRead = SignalDeepRead & {
  topicSlug: string
  threadSlug: string
  status?: string
}

export type StaticRadarSnapshot = {
  version?: number
  date?: string
  generatedAt?: string
  pulse?: {
    text?: string | null
    date?: string | null
    topItemIds?: Array<number | string>
    takeaway?: RadarTakeaway | null
    sourceItemIds?: Array<number | string>
  } | null
  items?: StaticRadarItem[]
  stats?: StaticRadarStat[]
  topics?: StaticRadarTopic[]
  deepReads?: StaticRadarDeepRead[]
  latestRun?: {
    completedAt?: string | null
    startedAt?: string | null
  } | null
}

function readStaticRadarSnapshotFile() {
  const snapshot = latestRadarSnapshot as StaticRadarSnapshot
  return snapshot?.items?.length ? snapshot : null
}

async function fetchStaticRadarSnapshot({ cacheBust = false } = {}) {
  try {
    const query = cacheBust ? `?t=${Date.now()}` : ''
    return await $fetch<StaticRadarSnapshot>(`/radar/latest.json${query}`)
  } catch {
    return null
  }
}

export function useStaticRadarSnapshot(
  key = 'radar-latest',
  options: { immediate?: boolean } = {},
) {
  const asyncData = useAsyncData<StaticRadarSnapshot | null>(
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

  if (import.meta.client) {
    onMounted(async () => {
      const fetchedSnapshot = await fetchStaticRadarSnapshot({ cacheBust: true })
      if (isNewerRadarSnapshot(fetchedSnapshot, asyncData.data.value)) {
        asyncData.data.value = fetchedSnapshot
      }
    })
  }

  return asyncData
}
