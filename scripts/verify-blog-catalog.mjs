import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const archivePage = readFileSync(join(root, 'pages', 'blogs', 'index.vue'), 'utf8')
const locales = ['en', 'zh']

function publishedPostNames(locale) {
  const directory = join(root, 'content', 'blogs', locale)
  return readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => /^\d+\./.test(name))
    .filter((name) => /^published:\s*true\s*$/m.test(readFileSync(join(directory, name), 'utf8')))
    .sort()
}

const postsByLocale = Object.fromEntries(
  locales.map((locale) => [locale, publishedPostNames(locale)]),
)
const [englishPosts, chinesePosts] = locales.map((locale) => postsByLocale[locale])
const chineseOnly = chinesePosts.filter((name) => !englishPosts.includes(name))
const englishOnly = englishPosts.filter((name) => !chinesePosts.includes(name))

if (englishOnly.length || chineseOnly.length) {
  throw new Error(
    `Published blog translations are out of sync. English-only: ${englishOnly.join(', ') || 'none'}; Chinese-only: ${chineseOnly.join(', ') || 'none'}.`,
  )
}

const limitMatch = archivePage.match(/const BLOG_ARCHIVE_QUERY_LIMIT = (\d+)/)
if (!limitMatch) {
  throw new Error(
    'Blog archive must declare BLOG_ARCHIVE_QUERY_LIMIT for a complete catalog query.',
  )
}

const queryLimit = Number(limitMatch[1])
if (queryLimit < englishPosts.length) {
  throw new Error(
    `Blog archive query limit (${queryLimit}) is below the published catalog (${englishPosts.length}). Increase the limit before publishing.`,
  )
}

for (const locale of locales) {
  if (!archivePage.includes(`queryCollection('${locale}').limit(BLOG_ARCHIVE_QUERY_LIMIT).all()`)) {
    throw new Error(`Blog archive must use BLOG_ARCHIVE_QUERY_LIMIT for the ${locale} collection.`)
  }
}

console.log(
  `Blog catalog verified: ${englishPosts.length} published EN/ZH pairs; archive query limit ${queryLimit}.`,
)
