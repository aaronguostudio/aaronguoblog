export const SOURCE_META = {
  hackernews: { label: 'HN', colorClass: 'bg-orange-500', borderClass: 'border-l-orange-400' },
  'x-twitter': { label: 'X', colorClass: 'bg-foreground', borderClass: 'border-l-foreground' },
  x: { label: 'X', colorClass: 'bg-foreground', borderClass: 'border-l-foreground' },
  reddit: { label: 'Reddit', colorClass: 'bg-purple-500', borderClass: 'border-l-purple-500' },
  producthunt: { label: 'PH', colorClass: 'bg-amber-500', borderClass: 'border-l-amber-500' },
  github: { label: 'GitHub', colorClass: 'bg-pink-500', borderClass: 'border-l-pink-500' },
  lobsters: { label: 'Lobsters', colorClass: 'bg-red-400', borderClass: 'border-l-red-400' },
  arxiv: { label: 'ArXiv', colorClass: 'bg-cyan-400', borderClass: 'border-l-cyan-400' },
  youtube: { label: 'YouTube', colorClass: 'bg-red-500', borderClass: 'border-l-red-500' },
  tiktok: { label: 'TikTok', colorClass: 'bg-sky-500', borderClass: 'border-l-sky-500' },
  instagram: { label: 'Instagram', colorClass: 'bg-fuchsia-500', borderClass: 'border-l-fuchsia-500' },
  polymarket: { label: 'Polymarket', colorClass: 'bg-blue-500', borderClass: 'border-l-blue-500' },
  web: { label: 'Web', colorClass: 'bg-emerald-500', borderClass: 'border-l-emerald-500' },
}

export function getSupportedSources() {
  return Object.keys(SOURCE_META)
}

export function getSourceLabel(source) {
  return SOURCE_META[source]?.label || source
}

export function getSourceColorClass(source) {
  return SOURCE_META[source]?.colorClass || 'bg-muted-foreground'
}

export function getSourceBorderClass(source) {
  return SOURCE_META[source]?.borderClass || 'border-l-muted-foreground'
}
