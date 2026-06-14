export function generateRadarPulse({ date, items }) {
  const validItems = items.filter(item => hasNonEmptyId(item.id))
  const sorted = [...validItems].sort((a, b) => {
    const relevanceDiff = Number(b.relevance || 0) - Number(a.relevance || 0)
    if (relevanceDiff !== 0) return relevanceDiff

    const scoreDiff = Number(b.score || 0) - Number(a.score || 0)
    if (scoreDiff !== 0) return scoreDiff

    const publishedDiff = publishedTime(b.publishedAt) - publishedTime(a.publishedAt)
    if (publishedDiff !== 0) return publishedDiff

    const topicDiff = normalizeText(a.topicSlug).localeCompare(normalizeText(b.topicSlug))
    if (topicDiff !== 0) return topicDiff

    const sourceDiff = normalizeText(a.source).localeCompare(normalizeText(b.source))
    if (sourceDiff !== 0) return sourceDiff

    return normalizeText(a.id).localeCompare(normalizeText(b.id), undefined, { numeric: true })
  })

  const topItems = sorted.slice(0, 5)
  if (topItems.length === 0) {
    return {
      date,
      pulseText: 'Radar did not find enough high-signal items for this run.',
      topItemIds: [],
    }
  }

  const topicSlugs = [...new Set(topItems.map(item => normalizeText(item.topicSlug)).filter(Boolean))]
  const topicText = topicSlugs.length === 1
    ? topicSlugs[0]
    : topicSlugs.length > 1
      ? `${topicSlugs.slice(0, -1).join(', ')} and ${topicSlugs.at(-1)}`
      : 'tracked topics'
  const themes = topItems
    .slice(0, 3)
    .map(item => firstNonEmptyText(item.title, item.clusterTitle, item.summary))
    .filter(Boolean)
    .join('; ')

  if (!themes) {
    return {
      date,
      pulseText: 'Radar found activity, but the item titles were not descriptive enough to summarize.',
      topItemIds: topItems.map(item => item.id),
    }
  }

  return {
    date,
    pulseText: `Radar found ${topItems.length} high-signal items across ${topicText}. Top themes: ${themes}.`,
    topItemIds: topItems.map(item => item.id),
  }
}

function hasNonEmptyId(id) {
  return id !== null && id !== undefined && String(id).trim() !== ''
}

function firstNonEmptyText(...values) {
  return values.map(value => normalizeText(value).replace(/\.+$/, '')).find(Boolean) || ''
}

function normalizeText(value) {
  return value === null || value === undefined ? '' : String(value).trim()
}

function publishedTime(value) {
  const time = Date.parse(value)
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}
