import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SIGNAL_PAGE = readFileSync(new URL('../../pages/signal.vue', import.meta.url), 'utf8')
const SIGNAL_BRIEFS_DATA = new URL('../../data/signal/briefs.ts', import.meta.url)
const SIGNAL_BRIEFS_COMPONENT = new URL('../../components/signal/Briefs.vue', import.meta.url)
const EN_SIGNAL_BRIEF_BLOG_POST = new URL(
  '../../content/blogs/en/26.signal-brief-ai-native-work-2026-06-21.md',
  import.meta.url,
)
const ZH_SIGNAL_BRIEF_BLOG_POST = new URL(
  '../../content/blogs/zh/26.signal-brief-ai-native-work-2026-06-21.md',
  import.meta.url,
)
const HOME_PAGE = readFileSync(new URL('../../pages/index.vue', import.meta.url), 'utf8')
const MAIN_WRITING = readFileSync(new URL('../../components/main/writing.vue', import.meta.url), 'utf8')
const MAIN_SIGNAL = readFileSync(new URL('../../components/main/signal.vue', import.meta.url), 'utf8')
const SIGNAL_RESEARCH_THREADS_COMPONENT = readFileSync(
  new URL('../../components/signal/ResearchThreads.vue', import.meta.url),
  'utf8',
)
const EN_LOCALE = readFileSync(new URL('../../i18n/locales/en-US.json', import.meta.url), 'utf8')
const ZH_LOCALE = readFileSync(new URL('../../i18n/locales/zh-CN.json', import.meta.url), 'utf8')
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

  it('renders Signal research threads from static editorial data', () => {
    expect(SIGNAL_PAGE).toContain("import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'")
    expect(SIGNAL_PAGE).toContain("import { createSignalThreadCards } from '~/utils/signal-threads'")
    expect(SIGNAL_PAGE).toContain('const researchSignalItems = computed')
    expect(SIGNAL_PAGE).toContain('if (hasStaticSnapshot.value) return getStaticItems()')
    expect(SIGNAL_PAGE).toContain('const threadCards = computed')
    expect(SIGNAL_PAGE).toContain('items: researchSignalItems.value')
    expect(SIGNAL_PAGE).toContain('locale: locale.value')
    expect(SIGNAL_PAGE).toContain('<SignalResearchThreads')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('What I\'m Watching')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('matchedSignals')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('thread.matchedSignals.length > 3')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).not.toContain('thread.unmatchedSignalCount > 0')
    expect(EN_LOCALE).toContain('"watchingTitle": "What I\'m Watching"')
    expect(ZH_LOCALE).toContain('"watchingTitle": "我正在关注"')
    expect(MAIN_SIGNAL).toContain("t('signal.previewDescription')")
    expect(EN_LOCALE).toContain(
      '"previewDescription": "Daily signals from my AI-native product research desk."',
    )
    expect(ZH_LOCALE).toContain('"previewDescription": "来自我的 AI 原生产品研究台的每日信号。"')
  })

  it('keeps Signal Briefs out of Writing and renders them on Signal', () => {
    expect(existsSync(EN_SIGNAL_BRIEF_BLOG_POST)).toBe(false)
    expect(existsSync(ZH_SIGNAL_BRIEF_BLOG_POST)).toBe(false)
    expect(existsSync(SIGNAL_BRIEFS_DATA)).toBe(true)
    expect(existsSync(SIGNAL_BRIEFS_COMPONENT)).toBe(true)
    expect(SIGNAL_PAGE).toContain("import { SIGNAL_BRIEFS } from '~/data/signal/briefs'")
    expect(SIGNAL_PAGE).toContain("import { createSignalBriefCards } from '~/utils/signal-briefs'")
    expect(SIGNAL_PAGE).toContain('const briefCards = computed')
    expect(SIGNAL_PAGE).toContain('<SignalBriefs')

    const signalBriefsData = readFileSync(SIGNAL_BRIEFS_DATA, 'utf8')
    const signalBriefsComponent = readFileSync(SIGNAL_BRIEFS_COMPONENT, 'utf8')

    expect(signalBriefsData).toContain('Signal Brief: Coding Agents Are Becoming Workflow Owners')
    expect(signalBriefsData).toContain('Signal Brief：Coding agents 正在变成工作流负责人')
    expect(signalBriefsComponent).toContain('brief.sections')
    expect(EN_LOCALE).toContain('"briefsTitle": "Signal Briefs"')
    expect(ZH_LOCALE).toContain('"briefsTitle": "Signal Briefs"')
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
