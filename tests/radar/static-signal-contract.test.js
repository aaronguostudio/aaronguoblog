import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SIGNAL_PAGE = readFileSync(new URL('../../pages/signal/index.vue', import.meta.url), 'utf8')
const SIGNAL_BRIEFS_DATA = new URL('../../data/signal/briefs.ts', import.meta.url)
const SIGNAL_BRIEFS_COMPONENT = new URL('../../components/signal/Briefs.vue', import.meta.url)
const SIGNAL_FINDING_COMPONENT = new URL('../../components/signal/EditionFinding.vue', import.meta.url)
const SIGNAL_PULSE_COMPONENT = new URL('../../components/signal/Pulse.vue', import.meta.url)
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
const SIGNAL_PULSE_UTIL = new URL('../../utils/signal-pulse.ts', import.meta.url)
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
    expect(SIGNAL_PAGE).not.toContain("'/api/signal'")
  })

  it('features the current dated Signal edition and links to the archive', () => {
    expect(MAIN_SIGNAL).toContain("import { coverImage, signalEditions } from '~/data/signal/editions'")
    expect(MAIN_SIGNAL).toContain('const latestEdition = signalEditions[0]')
    expect(MAIN_SIGNAL).not.toContain('previousEditions')
    expect(MAIN_SIGNAL).toContain("localePath('/signal/editions/' + latestEdition.date)")
    expect(MAIN_SIGNAL).toContain(':src="coverImage(latestEdition)"')
    expect(MAIN_SIGNAL).toContain("localePath('/signal/editions')")
    expect(HOME_PAGE + MAIN_SIGNAL).not.toContain('useStaticRadarSnapshot')
  })

  it('places the latest video below Signal on desktop and mobile', () => {
    expect(HOME_PAGE).toMatch(/<MainSignal class="mx-4 lg:hidden" \/>\s*<MainLatestBrief class="lg:hidden" \/>/)
    expect(MAIN_WRITING).toMatch(/<MainSignal class="hidden shrink-0 lg:block" \/>\s*<MainLatestBrief class="hidden lg:block" \/>/)
    expect(MAIN_WRITING.indexOf(':to="localePath(heroPost.path)"')).toBeLessThan(
      MAIN_WRITING.indexOf('<MainSignal'),
    )
    expect(MAIN_WRITING.indexOf('<MainLatestBrief')).toBeLessThan(
      MAIN_WRITING.indexOf('v-for="post in sidebarPosts"'),
    )
    expect(MAIN_WRITING).toContain("t('home.readArticle')")
    expect(EN_LOCALE).toContain('"readArticle": "Read article"')
    expect(ZH_LOCALE).toContain('"readArticle": "阅读全文"')
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
    expect(SIGNAL_PAGE).toContain('const threadCards = computed')
    expect(SIGNAL_PAGE).toContain('items: researchSignalItems.value')
    expect(SIGNAL_PAGE).toContain('locale: locale.value')
    expect(SIGNAL_PAGE).toContain('<SignalResearchThreads')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('horizonMeta')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('openSlug === thread.slug')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('matchedSignals')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('thread.matchedSignals.slice(0, 2)')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).not.toContain('thread.unmatchedSignalCount > 0')
    expect(EN_LOCALE).toContain('"watchingTitle": "What I\'m Watching"')
    expect(ZH_LOCALE).toContain('"watchingTitle": "我正在关注"')
  })

  it('renders Signal as a wider research desk product surface', () => {
    expect(existsSync(SIGNAL_FINDING_COMPONENT)).toBe(true)
    expect(existsSync(SIGNAL_PULSE_COMPONENT)).toBe(true)
    expect(SIGNAL_PAGE).toContain('<SignalEditionFinding :edition="signalEditions[0]"')
    expect(SIGNAL_PAGE).toContain('<SignalPulse')
    expect(SIGNAL_PAGE).not.toContain('focusedThread')
    expect(SIGNAL_PAGE).toContain('signal.radarReadout')
    expect(SIGNAL_PAGE).toContain('const pulseCards = computed')
    expect(SIGNAL_PAGE).toContain('showPulseEvidence')
    expect(SIGNAL_PAGE).not.toContain('/api/signal-pulse')
    expect(SIGNAL_PAGE).toContain('max-w-[90rem]')

    const findingComponent = readFileSync(SIGNAL_FINDING_COMPONENT, 'utf8')
    const signalPulseComponent = readFileSync(SIGNAL_PULSE_COMPONENT, 'utf8')

    expect(findingComponent).toContain('edition.signal.claim[language]')
    expect(findingComponent).toContain('edition.signal.nextCheck[language]')
    expect(findingComponent).toContain('v-for="item in edition.items"')
    expect(findingComponent).toContain(':href="item.evidence"')
    expect(signalPulseComponent).toContain('pulseCards')
    expect(signalPulseComponent).toContain('machineLabel')
    expect(signalPulseComponent).toContain('v-if="open"')

    expect(EN_LOCALE).toContain('"heroEyebrow": "Live research desk"')
    expect(EN_LOCALE).toContain('"latestRead": "Current Signal read"')
    expect(EN_LOCALE).toContain('"evidenceTitle": "Evidence Feed"')
    expect(ZH_LOCALE).toContain('"heroEyebrow": "实时研究台"')
    expect(ZH_LOCALE).toContain('"latestRead": "当前 Signal 读数"')
    expect(ZH_LOCALE).toContain('"evidenceTitle": "证据流"')
  })

  it('keeps the full evidence stream at the page bottom and loads it progressively', () => {
    expect(SIGNAL_PAGE).toContain('id="signal-workbench"')
    expect(SIGNAL_PAGE).not.toContain('v-if="showEvidenceWorkbench"')
    expect(SIGNAL_PAGE).toContain('ref="loadMoreSentinel"')
    expect(SIGNAL_PAGE).toContain('useIntersectionObserver(')
    expect(SIGNAL_PAGE).toContain("rootMargin: '600px 0px'")
    expect(SIGNAL_PAGE).toContain('filteredItems.value.slice(0, visibleLimit.value)')
    expect(SIGNAL_PAGE).toContain('visibleLimit.value += 50')
  })

  it('turns Signal into a progressive evidence-to-thesis path', () => {
    expect(existsSync(SIGNAL_PULSE_UTIL)).toBe(true)
    expect(SIGNAL_PAGE).toContain('signal.radarCoverage')

    const signalBriefsData = readFileSync(SIGNAL_BRIEFS_DATA, 'utf8')
    const signalBriefsComponent = readFileSync(SIGNAL_BRIEFS_COMPONENT, 'utf8')

    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('thesisLabel')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('productAngleLabel')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('thread.horizon')
    expect(SIGNAL_RESEARCH_THREADS_COMPONENT).toContain('toggleThread')
    expect(signalBriefsData).toContain("cadence: 'weekly'")
    expect(signalBriefsData).toContain('signalCount: 5')
    expect(signalBriefsData).toContain("funnelStage: 'brief'")
    expect(signalBriefsComponent).toContain('openSlug === brief.slug')
    expect(signalBriefsComponent).toContain('brief.signalCount')
    expect(signalBriefsComponent).toContain('brief.sections')
    expect(EN_LOCALE).toContain('"activeThesis": "Active thesis"')
    expect(EN_LOCALE).toContain('"weeklyBrief": "Weekly brief"')
    expect(EN_LOCALE).toContain('"horizonTitle": "Three things worth watching"')
    expect(ZH_LOCALE).toContain('"activeThesis": "活跃假设"')
    expect(ZH_LOCALE).toContain('"weeklyBrief": "周度 brief"')
    expect(ZH_LOCALE).toContain('"horizonTitle": "三个值得关注的方向"')
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
