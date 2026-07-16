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

  it('keeps Learn as a separate menu after Build', () => {
    const header = readFileSync(join(root, 'components', 'main', 'header.vue'), 'utf8')

    expect(header).toContain("t('navigation.build')")
    expect(header).toContain("t('navigation.learn')")
    expect(header.indexOf("path: '/signal'")).toBeLessThan(header.indexOf("path: '/build'"))
    expect(header.indexOf("path: '/build'")).toBeLessThan(header.indexOf("path: '/learn'"))
    expect(header.indexOf("path: '/learn'")).toBeLessThan(header.indexOf("path: '/about'"))
  })

  it('keeps both Notes and Learn in the footer navigation', () => {
    const footer = readFileSync(join(root, 'components', 'main', 'footer.vue'), 'utf8')

    expect(footer).toContain("localePath('/notes')")
    expect(footer).toContain("localePath('/learn')")
  })
})
