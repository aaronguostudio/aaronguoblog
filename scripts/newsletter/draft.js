#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export const DEFAULT_FEED_URL = 'https://www.aaronguo.com/rss.xml'

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
}

function stripCdata(value) {
  const trimmed = value.trim()
  const cdataMatch = trimmed.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)
  return cdataMatch ? cdataMatch[1] : trimmed
}

function readTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`))
  return match ? decodeXml(stripCdata(match[1])).trim() : ''
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function truncate(value, maxLength) {
  const normalized = normalizeWhitespace(value)
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}...`
}

export function parseRssItems(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map((match) => {
    const block = match[1]
    return {
      title: readTag(block, 'title'),
      link: readTag(block, 'link'),
      pubDate: readTag(block, 'pubDate'),
      description: normalizeWhitespace(readTag(block, 'description').replace(/<[^>]+>/g, '')),
    }
  })
}

export function buildNewsletterDraft(item) {
  const preview = truncate(item.description, 150)

  return `# Beehiiv Newsletter Draft

Subject: New post: ${item.title}
Preview text: ${preview}

---

Hi,

I just published a new essay on the blog.

${item.title}

${item.description}

Read it here:
${item.link}

You are receiving this because you subscribed at aaronguo.com.

---

Send checklist:
- Paste the subject into Beehiiv's subject field.
- Paste the preview text into Beehiiv's preview text field.
- Paste the body into the Beehiiv editor.
- Send a test email to yourself first.
- Confirm the link opens the live blog post.
`
}

function readFlagValue(argv, index, flag) {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

export function parseArgs(argv) {
  const args = { feedUrl: DEFAULT_FEED_URL, index: 0, out: undefined }

  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--feed') {
      args.feedUrl = readFlagValue(argv, index, value)
      index += 1
      continue
    }

    if (value === '--index') {
      args.index = Number.parseInt(readFlagValue(argv, index, value), 10)
      if (!Number.isInteger(args.index) || args.index < 0) {
        throw new Error('--index must be a non-negative integer')
      }
      index += 1
      continue
    }

    if (value === '--out') {
      args.out = readFlagValue(argv, index, value)
      index += 1
      continue
    }

    if (value === '--help') {
      args.help = true
      continue
    }

    throw new Error(`Unknown argument: ${value}`)
  }

  return args
}

function usage() {
  return `Usage: pnpm newsletter:draft [--feed url] [--index 0] [--out path]

Generates a Beehiiv-ready newsletter draft from the latest RSS item.
`
}

export async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(usage())
    return
  }

  const response = await fetch(args.feedUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  const items = parseRssItems(xml)
  const item = items[args.index]

  if (!item) {
    throw new Error(`No RSS item found at index ${args.index}; feed has ${items.length} items`)
  }

  const draft = buildNewsletterDraft(item)
  if (args.out) {
    await writeFile(args.out, draft)
    console.log(`Wrote newsletter draft to ${args.out}`)
    return
  }

  console.log(draft)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
