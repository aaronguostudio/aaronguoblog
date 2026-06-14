import { canonicalizeUrl } from './url.js'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function scoreToRelevance(candidate, topic) {
  const finalScore = Number(candidate.final_score || 0)
  const rerankScore = Number(candidate.rerank_score || 0)
  const localRelevance = Number(candidate.local_relevance || 0)

  const derived = Math.round(
    finalScore / 10 || rerankScore * 10 || localRelevance * 10 || topic.minRelevance || 1
  )

  return clamp(derived, 1, 10)
}

function getPrimarySourceItem(candidate) {
  if (!Array.isArray(candidate.source_items) || candidate.source_items.length === 0) return undefined
  return candidate.source_items.find(item => item.source === candidate.source) || candidate.source_items[0]
}

function getClusterTitle(report, clusterId) {
  if (!clusterId || !Array.isArray(report.clusters)) return undefined
  return report.clusters.find(cluster => cluster.cluster_id === clusterId)?.title
}

export function normalizeLast30DaysReport({ report, topic }) {
  if (!report || !Array.isArray(report.ranked_candidates)) return []

  return report.ranked_candidates
    .map(candidate => {
      const primary = getPrimarySourceItem(candidate)
      const url = candidate.url || primary?.url || ''
      const canonicalUrl = canonicalizeUrl(url)
      const title = candidate.title || primary?.title || ''

      if (!canonicalUrl || !title) return undefined

      const engagement = typeof candidate.engagement === 'number'
        ? candidate.engagement
        : Number(primary?.engagement?.score || primary?.engagement?.likes || 0)

      return {
        canonicalUrl,
        source: candidate.source || primary?.source || 'web',
        sourceItemId: candidate.item_id || primary?.item_id,
        url,
        title,
        summary: candidate.snippet || primary?.snippet || primary?.body || '',
        aiSummary: candidate.explanation || primary?.why_relevant || candidate.snippet || '',
        author: primary?.author,
        score: engagement,
        relevance: scoreToRelevance(candidate, topic),
        category: topic.category,
        topicSlug: topic.slug,
        clusterId: candidate.cluster_id,
        clusterTitle: getClusterTitle(report, candidate.cluster_id),
        publishedAt: primary?.published_at,
        raw: {
          candidate,
          rangeFrom: report.range_from,
          rangeTo: report.range_to,
          generatedAt: report.generated_at,
        },
      }
    })
    .filter(Boolean)
}
