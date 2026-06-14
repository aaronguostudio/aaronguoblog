import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SIGNAL_PAGE = readFileSync(new URL('../../pages/signal.vue', import.meta.url), 'utf8')
const MAIN_SIGNAL = readFileSync(new URL('../../components/main/signal.vue', import.meta.url), 'utf8')
const NUXT_CONFIG = readFileSync(new URL('../../nuxt.config.ts', import.meta.url), 'utf8')
const STATIC_EXPORT = readFileSync(new URL('../../scripts/radar/static-export.js', import.meta.url), 'utf8')

describe('static Signal contract', () => {
  it('exports topicSlug in static Radar items for topic filtering', () => {
    expect(STATIC_EXPORT).toContain('topicSlug: String(row.topic_slug)')
  })

  it('makes the full Signal page read the static Radar snapshot first', () => {
    expect(SIGNAL_PAGE).toContain("'/radar/latest.json'")
    expect(SIGNAL_PAGE.indexOf("'/radar/latest.json'")).toBeLessThan(SIGNAL_PAGE.indexOf("'/api/signal'"))
  })

  it('makes the homepage Signal preview read the static Radar snapshot first', () => {
    expect(MAIN_SIGNAL).toContain("'/radar/latest.json'")
    expect(MAIN_SIGNAL.indexOf("'/radar/latest.json'")).toBeLessThan(MAIN_SIGNAL.indexOf("'/api/signal'"))
  })

  it('allows Signal routes to be prerendered', () => {
    expect(NUXT_CONFIG).not.toContain("ignore: ['/__og-image__', '/signal', '/zh/signal']")
    expect(NUXT_CONFIG).toContain("'/signal': { prerender: true }")
    expect(NUXT_CONFIG).toContain("'/zh/signal': { prerender: true }")
  })
})
