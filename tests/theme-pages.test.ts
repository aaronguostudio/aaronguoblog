import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (...segments: string[]) => readFileSync(join(root, ...segments), 'utf8')

describe('editorial page themes', () => {
  it('lets the global color-mode preference control every route', () => {
    const app = read('app.vue')
    const layout = read('layouts', 'default.vue')
    const header = read('components', 'main', 'header.vue')

    expect(app).not.toContain('useNativeDarkPage')
    expect(layout).not.toContain('useNativeDarkPage')
    expect(header).not.toContain('useNativeDarkPage')
    expect(header).not.toContain('native-dark-header')
    expect(existsSync(join(root, 'composables', 'useNativeDarkPage.ts'))).toBe(false)
  })

  it('gives Signal semantic light and dark palettes without a forced dark root', () => {
    const page = read('pages', 'signal.vue')
    const styles = read('assets', 'css', 'tailwind.css')
    const components = ['Hero.vue', 'Pulse.vue', 'ResearchThreads.vue', 'Briefs.vue']
      .map((file) => read('components', 'signal', file))
      .join('\n')

    expect(page).toContain('<div class="signal-page">')
    expect(page).not.toContain('<div class="dark')
    expect(styles).toContain('.signal-page {')
    expect(styles).toContain('.dark .signal-page {')
    expect(styles).toContain('--signal-accent: #0e7490')
    expect(styles).toContain('--signal-accent: #67e8f9')
    expect(components).not.toMatch(/(?:border|divide)-white/)
    expect(components).not.toContain('text-[#f8f1e4]')
  })

  it('keeps the About hero cinematic while its surrounding content follows color mode', () => {
    const page = read('pages', 'about.vue')
    const journey = read('components', 'about', 'AboutScrollJourney.vue')

    expect(page).toContain('<div class="about-page">')
    expect(page).toContain(':global(html.dark .about-page)')
    expect(journey).toContain('about-hero-panel')
    expect(journey).toContain('about-ways-panel')
    expect(journey).toMatch(/about-hero-panel[^\n]+bg-\[#050608\][^\n]+text-\[#f8f1e4\]/)
  })
})
