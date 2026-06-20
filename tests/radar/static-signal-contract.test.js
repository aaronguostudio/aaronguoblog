import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SIGNAL_PAGE = readFileSync(new URL('../../pages/signal.vue', import.meta.url), 'utf8')
const HOME_PAGE = readFileSync(new URL('../../pages/index.vue', import.meta.url), 'utf8')
const MAIN_WRITING = readFileSync(new URL('../../components/main/writing.vue', import.meta.url), 'utf8')
const MAIN_SIGNAL = readFileSync(new URL('../../components/main/signal.vue', import.meta.url), 'utf8')
const NUXT_CONFIG = readFileSync(new URL('../../nuxt.config.ts', import.meta.url), 'utf8')
const STATIC_EXPORT = readFileSync(new URL('../../scripts/radar/static-export.js', import.meta.url), 'utf8')
const STATIC_SNAPSHOT_COMPOSABLE = readFileSync(
  new URL('../../composables/useStaticRadarSnapshot.ts', import.meta.url),
  'utf8',
)

describe('static Signal contract', () => {
  it('exports topicSlug in static Radar items for topic filtering', () => {
    expect(STATIC_EXPORT).toContain('topicSlug: String(row.topic_slug)')
  })

  it('makes the full Signal page read the static Radar snapshot first', () => {
    expect(SIGNAL_PAGE).toContain("useStaticRadarSnapshot('signal-radar-latest')")
    expect(SIGNAL_PAGE.indexOf('useStaticRadarSnapshot')).toBeLessThan(SIGNAL_PAGE.indexOf("'/api/signal'"))
  })

  it('makes the homepage Signal preview read the static Radar snapshot first', () => {
    expect(HOME_PAGE).toContain("useStaticRadarSnapshot('home-radar-latest')")
    expect(HOME_PAGE).toContain(':signal-snapshot="staticSnapshot"')
    expect(MAIN_WRITING).toContain('signalSnapshot?: StaticRadarSnapshot | null')
    expect(MAIN_WRITING).toContain(':snapshot="signalSnapshot"')
    expect(MAIN_SIGNAL).toContain('snapshot?: StaticRadarSnapshot | null')
    expect(MAIN_SIGNAL).toMatch(/useStaticRadarSnapshot\(\s*'homepage-signal-radar-latest'/)
    expect(MAIN_SIGNAL.indexOf('useStaticRadarSnapshot')).toBeLessThan(MAIN_SIGNAL.indexOf("'/api/signal'"))
  })

  it('uses the generated static Radar JSON during SSG and public JSON as fallback', () => {
    expect(STATIC_SNAPSHOT_COMPOSABLE).toContain(
      "import latestRadarSnapshot from '~/public/radar/latest.json'",
    )
    expect(STATIC_SNAPSHOT_COMPOSABLE).toContain("import { isNewerRadarSnapshot } from '~/utils/radar-snapshot'")
    expect(STATIC_SNAPSHOT_COMPOSABLE).not.toContain("import('node:fs/promises')")
    expect(STATIC_SNAPSHOT_COMPOSABLE).not.toContain("import('node:path')")
    expect(STATIC_SNAPSHOT_COMPOSABLE).toContain('/radar/latest.json')
    expect(STATIC_SNAPSHOT_COMPOSABLE).toContain('cacheBust')
    expect(STATIC_SNAPSHOT_COMPOSABLE).toContain('isNewerRadarSnapshot(fetchedSnapshot, asyncData.data.value)')
  })

  it('allows Signal routes to be prerendered', () => {
    expect(NUXT_CONFIG).not.toContain("ignore: ['/__og-image__', '/signal', '/zh/signal']")
    expect(NUXT_CONFIG).toContain("'/signal': { prerender: true }")
    expect(NUXT_CONFIG).toContain("'/zh/signal': { prerender: true }")
  })

  it('keeps homepage routes static to avoid stale HTML and build manifest drift', () => {
    expect(NUXT_CONFIG).not.toContain("'/': { swr:")
    expect(NUXT_CONFIG).not.toContain("'/zh': { swr:")
    expect(NUXT_CONFIG).toContain("'/': { prerender: true }")
    expect(NUXT_CONFIG).toContain("'/zh': { prerender: true }")
  })
})
