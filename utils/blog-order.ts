import { parseDate } from './date'

interface DatedBlogPost {
  date: string
  sourceId: string
}

function publicationSequence(sourceId: string): number {
  return Number(sourceId.match(/(?:^|\/)(\d+)\./)?.[1] || 0)
}

/** Newest date first; numbered source files resolve posts published on the same day. */
export function sortBlogPosts<T extends DatedBlogPost>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const dateDifference = parseDate(b.date).getTime() - parseDate(a.date).getTime()
    return dateDifference || publicationSequence(b.sourceId) - publicationSequence(a.sourceId)
  })
}
