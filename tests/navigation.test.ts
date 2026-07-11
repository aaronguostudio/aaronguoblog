import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('main navigation', () => {
  it('uses the logo for Home and places Notes between Writing and Videos', () => {
    const header = readFileSync(join(root, 'components', 'main', 'header.vue'), 'utf8')

    expect(header).not.toContain("t('navigation.home')")
    expect(header.indexOf("path: '/blogs'")).toBeLessThan(header.indexOf("path: '/notes'"))
    expect(header.indexOf("path: '/notes'")).toBeLessThan(header.indexOf("path: '/videos'"))
  })

  it('shows Build immediately after Signal', () => {
    const header = readFileSync(join(root, 'components', 'main', 'header.vue'), 'utf8')

    expect(header).toContain("t('navigation.build')")
    expect(header.indexOf("path: '/signal'")).toBeLessThan(header.indexOf("path: '/build'"))
    expect(header.indexOf("path: '/build'")).toBeLessThan(header.indexOf("path: '/about'"))
  })
})
