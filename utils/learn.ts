export interface LearnNeighbor {
  name: string
  fullName: string
  category: string
  summary: string
  slug?: string
}

export interface LearnSource {
  title: string
  url: string
}

export interface LearnContentItem {
  path: string
  title: string
  fullName: string
  shortName: string
  description: string
  mentalModel: string
  date: string
  updated: string
  domain: string
  domainKey: string
  tags?: string[]
  maturity?: string
  published?: boolean
  featured?: boolean
  translationKey: string
  interaction?: string
  neighbors?: LearnNeighbor[]
  sources?: LearnSource[]
}

export interface LearnCardData extends LearnContentItem {
  path: string
  tags: string[]
  neighbors: LearnNeighbor[]
  sources: LearnSource[]
}

export interface LearnFilterOptions {
  query?: string
  domainKey?: string
}

export function getLearnSlug(contentPath: string): string {
  return contentPath.split('/').filter(Boolean).at(-1) || ''
}

export function getLearnRoute(contentPath: string): string {
  return `/learn/${getLearnSlug(contentPath)}`
}

export function prepareLearn(
  items: LearnContentItem[],
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): LearnCardData[] {
  return items
    .filter((item) => includeDrafts || item.published === true)
    .map((item) => ({
      ...item,
      path: getLearnRoute(item.path),
      tags: item.tags || [],
      neighbors: item.neighbors || [],
      sources: item.sources || [],
    }))
    .sort((left, right) => right.updated.localeCompare(left.updated))
}

export function filterLearn(
  items: LearnCardData[],
  { query = '', domainKey = 'all' }: LearnFilterOptions = {},
): LearnCardData[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return items.filter((item) => {
    if (domainKey !== 'all' && item.domainKey !== domainKey) return false
    if (!normalizedQuery) return true

    const searchableText = [
      item.title,
      item.fullName,
      item.shortName,
      item.description,
      item.mentalModel,
      item.domain,
      ...item.tags,
      ...item.neighbors.flatMap((neighbor) => [
        neighbor.name,
        neighbor.fullName,
        neighbor.category,
        neighbor.summary,
      ]),
    ]
      .join(' ')
      .toLocaleLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}
