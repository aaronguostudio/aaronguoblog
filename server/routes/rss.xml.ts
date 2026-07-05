import { Feed } from 'feed'
import {
  getRssPostDate,
  getRssPostUrl,
  isPublishedRssPost,
  type RssBlogPost,
} from '../../utils/rss'

const basePath = 'https://aaronguo.com'

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/xml')

  // Get the locale from the URL or default to 'en'
  const url = getRequestURL(event)
  const locale = url.pathname.startsWith('/zh') ? 'zh' : 'en'

  // Query the appropriate collection based on locale
  const docs = await queryCollection(event, locale as 'en' | 'zh').all()
  const publishedDocs = (docs as RssBlogPost[])
    .filter(isPublishedRssPost)
    .sort((a, b) => getRssPostDate(b).getTime() - getRssPostDate(a).getTime())

  const feed = new Feed({
    title: 'Aaron Guo — Ship with AI, not about AI',
    description: 'Real notes on product execution, AI-native systems, and building in public.',
    id: basePath,
    link: basePath,
    language: locale,
    favicon: `${basePath}/favicon.ico`,
    copyright: 'MIT',
    author: {
      name: 'Aaron Guo',
      email: 'aaronguostudio@gmail.com',
      link: basePath,
    },
  })

  // Add the feed items
  publishedDocs.forEach((doc) => {
    const link = getRssPostUrl(doc.path, locale, basePath)

    feed.addItem({
      title: doc.title || '',
      id: link,
      link,
      description: doc.description,
      content: doc.description,
      date: getRssPostDate(doc),
    })
  })

  return feed.rss2()
})
