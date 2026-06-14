export function generateRadarPulse({ date, items }) {
  const sorted = [...items].sort((a, b) => {
    const relevanceDiff = Number(b.relevance || 0) - Number(a.relevance || 0)
    if (relevanceDiff !== 0) return relevanceDiff
    return Number(b.score || 0) - Number(a.score || 0)
  })

  const topItems = sorted.slice(0, 5)
  if (topItems.length === 0) {
    return {
      date,
      pulseText: 'Radar did not find enough high-signal items for this run.',
      topItemIds: [],
    }
  }

  const topicSlugs = [...new Set(topItems.map(item => item.topicSlug).filter(Boolean))]
  const topicText = topicSlugs.length === 1
    ? topicSlugs[0]
    : `${topicSlugs.slice(0, -1).join(', ')} and ${topicSlugs.at(-1)}`
  const themes = topItems.slice(0, 3).map(item => item.title).join('; ')

  return {
    date,
    pulseText: `Radar found ${topItems.length} high-signal items across ${topicText}. Top themes: ${themes}.`,
    topItemIds: topItems.map(item => item.id),
  }
}
