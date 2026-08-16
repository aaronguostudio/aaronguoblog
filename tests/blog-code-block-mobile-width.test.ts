import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const blogPages = ['[blog].vue', '[...blog].vue']

describe('blog code blocks on mobile', () => {
  it.each(blogPages)('lets code blocks use the full article width in %s', (page) => {
    const source = readFileSync(join(root, 'pages', 'blogs', page), 'utf8')

    expect(source).toContain('prose-pre:max-w-full')
    expect(source).not.toContain('prose-pre:max-w-xs')
  })
})
