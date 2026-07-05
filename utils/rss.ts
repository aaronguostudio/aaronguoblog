import { parseDate } from './date'

export type RssLocale = 'en' | 'zh'

export interface RssBlogPost {
  path?: string
  title?: string
  description?: string
  meta?: {
    date?: string | number | Date
    published?: boolean | number
  }
  date?: string | number | Date
}

export function getRssPostDate(post: RssBlogPost): Date {
  const rawDate = post.meta?.date ?? post.date

  if (rawDate instanceof Date) {
    return rawDate
  }

  return parseDate(String(rawDate ?? ''))
}

export function isPublishedRssPost(post: RssBlogPost): boolean {
  return Boolean(post.meta?.published)
}

export function getRssPostUrl(
  path: string | undefined,
  locale: RssLocale,
  basePath = 'https://aaronguo.com',
): string {
  const base = basePath.replace(/\/$/, '')
  const slug = (path || '').replace(/^\/?blogs\/(en|zh)\//, '').replace(/^\/+/, '')

  if (locale === 'zh') {
    return `${base}/zh/blogs/${slug}`
  }

  return `${base}/blogs/${slug}`
}
