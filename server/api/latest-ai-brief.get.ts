import youtube from '~/data/youtube.json'

export default defineEventHandler(() => {
  const episodes = youtube.channels['ai-native-builder'].videos
  const episode = episodes.find(video => /(?:^|\|)\s*The AI Brief\b/i.test(video.title))
  if (!episode) return null

  const headline = episode.title.split(/\s*\|\s*/).find(part => !/^The AI Brief\b/i.test(part))
  return {
    id: episode.id,
    headline: headline || episode.title,
    thumbnail: episode.thumbnail,
    publishedAt: episode.publishedAt,
    durationSeconds: episode.durationSeconds,
  }
})
