import { Feed } from 'feed'

const basePath = 'https://aaronguo.com'

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/xml')

  // Get the locale from the URL or default to 'en'
  const url = getRequestURL(event)
  const locale = url.pathname.startsWith('/zh') ? 'zh' : 'en'

  // Query the appropriate collection based on locale
  const docs = await queryCollection(event, locale as 'en' | 'zh').all()

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
  docs.forEach((doc) => {
    // console.log(doc)
    feed.addItem({
      title: doc.title || '',
      id: basePath + doc.path,
      link: basePath + doc.path,
      description: doc.description,
      content: doc.description,
      date: new Date(doc.meta?.date as string),
    })
  })

  return feed.rss2()
})
