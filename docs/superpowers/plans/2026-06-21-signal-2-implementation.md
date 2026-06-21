# Signal 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Signal 2.0 slice: a static research-thread layer, a `What I'm Watching` section on `/signal`, updated homepage Signal framing, and the first Signal Brief post.

**Architecture:** Keep Radar ingestion and raw feed unchanged. Add a small versioned editorial layer under `data/signal`, resolve that editorial layer against the current static Radar feed with a focused utility, then render the result through a new Signal component. This keeps interpretation separate from ingestion and avoids adding a database or admin UI.

**Tech Stack:** Nuxt 3, Vue SFCs, TypeScript, static data modules, Nuxt Content Markdown, Vitest contract/utility tests, existing i18n JSON files.

---

## File Structure

- Create `data/signal/threads.ts`

  - Owns Signal 2.0 editorial thread data and related TypeScript types.
  - Stores bilingual copy for thread titles, theses, implications, open questions, and product hypotheses.
  - References supporting raw signals by stable URL and optional topic slug.

- Create `utils/signal-threads.ts`

  - Resolves editorial threads into renderable cards.
  - Matches supporting signal references against current Radar feed items by URL.
  - Keeps unmatched references as counts so threads do not break when a referenced item falls out of `latest.json`.

- Create `tests/signal-threads.test.ts`

  - Tests the editorial data shape and resolver behavior.

- Create `components/signal/ResearchThreads.vue`

  - Renders the `What I'm Watching` section.
  - Receives already-resolved cards as props.
  - Does not fetch data or know about Radar internals.

- Modify `pages/signal.vue`

  - Imports thread data and resolver utility.
  - Computes thread cards from the current `allItems`.
  - Inserts `SignalResearchThreads` below Today's Pulse and above the toolbar.
  - Updates hero copy through i18n keys.

- Modify `components/main/signal.vue`

  - Adjusts homepage Signal framing so the card reads as a research desk, not only a feed.

- Modify `i18n/locales/en-US.json`

  - Adds Signal 2.0 labels and copy.

- Modify `i18n/locales/zh-CN.json`

  - Adds matching Chinese copy.

- Modify `tests/radar/static-signal-contract.test.js`

  - Adds lightweight contract checks that `/signal` imports the thread data/component and the homepage preview includes the research-desk framing key.

- Create `content/blogs/en/26.signal-brief-ai-native-work-2026-06-21.md`

  - First English Signal Brief.

- Create `content/blogs/zh/26.signal-brief-ai-native-work-2026-06-21.md`
  - First Chinese Signal Brief.

---

### Task 1: Add Signal Research Thread Data

**Files:**

- Create: `data/signal/threads.ts`
- Test: `tests/signal-threads.test.ts`

- [ ] **Step 1: Write the failing tests for thread data shape**

Create `tests/signal-threads.test.ts` with this content:

```ts
import { describe, expect, it } from 'vitest'
import { SIGNAL_RESEARCH_THREADS } from '../data/signal/threads'

describe('Signal research threads', () => {
  it('defines the first three public research threads', () => {
    expect(SIGNAL_RESEARCH_THREADS.map((thread) => thread.slug)).toEqual([
      'coding-agents-own-workflows',
      'solo-builders-small-team-output',
      'internal-workflows-become-products',
    ])
  })

  it('includes bilingual reader-facing copy for every thread', () => {
    for (const thread of SIGNAL_RESEARCH_THREADS) {
      expect(thread.title.en).toMatch(/\S/)
      expect(thread.title.zh).toMatch(/\S/)
      expect(thread.thesis.en).toMatch(/\S/)
      expect(thread.thesis.zh).toMatch(/\S/)
      expect(thread.builderImplication.en).toMatch(/\S/)
      expect(thread.builderImplication.zh).toMatch(/\S/)
      expect(thread.productHypothesis.en).toMatch(/\S/)
      expect(thread.productHypothesis.zh).toMatch(/\S/)
      expect(thread.signalRefs.length).toBeGreaterThanOrEqual(2)
    }
  })
})
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts
```

Expected: FAIL because `../data/signal/threads` does not exist.

- [ ] **Step 3: Create the thread data module**

Create `data/signal/threads.ts` with this content:

```ts
export type SignalLocale = 'en' | 'zh'

export type LocalizedSignalText = Record<SignalLocale, string>

export type SignalThreadConfidence = 'low' | 'medium' | 'high'

export type SignalThreadRef = {
  url: string
  topicSlug?: string
  note: LocalizedSignalText
}

export type SignalResearchThread = {
  slug: string
  title: LocalizedSignalText
  thesis: LocalizedSignalText
  builderImplication: LocalizedSignalText
  confidence: SignalThreadConfidence
  lastUpdated: string
  signalRefs: SignalThreadRef[]
  openQuestion: LocalizedSignalText
  productHypothesis: LocalizedSignalText
}

export const SIGNAL_RESEARCH_THREADS: SignalResearchThread[] = [
  {
    slug: 'coding-agents-own-workflows',
    title: {
      en: 'Coding agents are becoming workflow owners',
      zh: 'Coding agents 正在变成工作流负责人',
    },
    thesis: {
      en: 'The important shift is not better autocomplete. It is agents taking responsibility for scoped tasks, repo context, review loops, and handoff.',
      zh: '关键变化不是更好的自动补全，而是 agent 开始承担有边界的任务、仓库上下文、review 循环和交付交接。',
    },
    builderImplication: {
      en: 'Builders need operating contracts for agents: what they can do, when they stop, and what evidence proves the work is real.',
      zh: '构建者需要为 agent 设计 operating contract：它能做什么、什么时候停、什么证据能证明工作是真的。',
    },
    confidence: 'high',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://cursor.com/',
        topicSlug: 'coding-agents',
        note: {
          en: 'Cursor is increasingly framed as an agent surface, not only an editor surface.',
          zh: 'Cursor 越来越像 agent 工作界面，而不只是编辑器界面。',
        },
      },
      {
        url: 'https://kiro.dev/',
        topicSlug: 'coding-agents',
        note: {
          en: 'Kiro explicitly frames the category as agentic engineering across IDE, CLI, and web.',
          zh: 'Kiro 明确把这个类别定义为跨 IDE、CLI 和 Web 的 agentic engineering。',
        },
      },
      {
        url: 'https://www.paralect.com/stack/top-agentic-ides',
        topicSlug: 'coding-agents',
        note: {
          en: 'Comparison content around agentic IDEs shows the category becoming legible to buyers.',
          zh: '围绕 agentic IDE 的对比内容说明这个类别正在被买家理解。',
        },
      },
    ],
    openQuestion: {
      en: 'Where does the handoff boundary belong between human judgment and autonomous coding work?',
      zh: '人的判断和自主编码工作之间，交接边界应该放在哪里？',
    },
    productHypothesis: {
      en: 'Agent Operating Contract: templates and review workflows for teams delegating real engineering work to agents.',
      zh: 'Agent Operating Contract：给团队委托真实工程任务给 agent 时使用的模板和 review 工作流。',
    },
  },
  {
    slug: 'solo-builders-small-team-output',
    title: {
      en: 'Solo builders are approaching small-team output',
      zh: '个人构建者正在接近小团队产出',
    },
    thesis: {
      en: 'AI-native builders can now combine product judgment, code generation, research, and distribution into one tighter operating loop.',
      zh: 'AI 原生构建者现在可以把产品判断、代码生成、研究和分发压缩进一个更紧密的操作循环。',
    },
    builderImplication: {
      en: 'The new leverage is not doing every task faster; it is designing a system where many small tasks keep moving while the human protects taste and direction.',
      zh: '新的杠杆不是把每个任务都做快，而是设计一个系统，让很多小任务持续推进，同时由人守住品味和方向。',
    },
    confidence: 'medium',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://news.ycombinator.com/item?id=48524387',
        topicSlug: 'personal-ai-systems',
        note: {
          en: 'Low-cost local AI infrastructure keeps lowering the experimentation floor.',
          zh: '低成本本地 AI 基础设施继续降低个人实验门槛。',
        },
      },
      {
        url: 'https://github.com/google-ai-edge/gallery',
        topicSlug: 'mobile-ai',
        note: {
          en: 'On-device model demos make local experimentation more accessible.',
          zh: '端侧模型 demo 让本地实验更容易被个人构建者使用。',
        },
      },
      {
        url: 'https://github.com/stevelaskaridis/awesome-mobile-llm',
        topicSlug: 'mobile-ai',
        note: {
          en: 'Mobile LLM resources point toward smaller, more personal product surfaces.',
          zh: 'Mobile LLM 资源指向更小、更个人化的产品界面。',
        },
      },
    ],
    openQuestion: {
      en: 'Which parts of a product studio can be systematized without making the work generic?',
      zh: '产品工作室的哪些部分可以系统化，同时不让作品变得平庸？',
    },
    productHypothesis: {
      en: 'Solo Product Studio OS: a repeatable workflow for turning signals into experiments, essays, and small products.',
      zh: 'Solo Product Studio OS：把信号转成实验、文章和小产品的可复用工作流。',
    },
  },
  {
    slug: 'internal-workflows-become-products',
    title: {
      en: 'Internal workflows are becoming product candidates',
      zh: '内部工作流正在变成产品候选',
    },
    thesis: {
      en: 'The best AI product ideas may come from workflows people already run manually: reports, research loops, reviews, audits, and handoffs.',
      zh: '最好的 AI 产品想法可能来自人们已经手动执行的工作流：报告、研究循环、review、audit 和交接。',
    },
    builderImplication: {
      en: 'Consulting work should be treated as discovery for repeatable tools, not only as one-off delivery.',
      zh: '咨询和项目工作应该被当成可复用工具的发现过程，而不只是一次性交付。',
    },
    confidence: 'medium',
    lastUpdated: '2026-06-21',
    signalRefs: [
      {
        url: 'https://techcrunch.com/2026/05/19/googles-ai-studio-now-lets-anyone-build-android-apps-in-minutes/',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'App-building tools keep compressing the distance between workflow and product surface.',
          zh: '应用构建工具持续压缩工作流和产品界面之间的距离。',
        },
      },
      {
        url: 'https://catdoes.com/blog/ai-mobile-app-builder',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'AI app-builder comparisons show demand for packaging expertise into buildable systems.',
          zh: 'AI app builder 对比内容说明市场需要把专业知识包装成可构建系统。',
        },
      },
      {
        url: 'https://bubble.io/blog/ai-tools-for-app-development/',
        topicSlug: 'consumer-ai-apps',
        note: {
          en: 'No-code and AI-assisted app tooling keeps turning internal process knowledge into software candidates.',
          zh: 'No-code 和 AI 辅助应用工具持续把内部流程知识变成软件候选。',
        },
      },
    ],
    openQuestion: {
      en: 'Which client or personal workflows are valuable enough to become repeatable products?',
      zh: '哪些客户或个人工作流足够有价值，值得变成可复用产品？',
    },
    productHypothesis: {
      en: 'AI Workflow Audit: a lightweight productized service that finds repeatable AI product opportunities inside a team.',
      zh: 'AI Workflow Audit：一个轻量产品化服务，用来在团队内部发现可复用的 AI 产品机会。',
    },
  },
]
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add data/signal/threads.ts tests/signal-threads.test.ts
git commit -m "feat(signal): add research thread data"
```

---

### Task 2: Add Thread Resolver Utilities

**Files:**

- Modify: `tests/signal-threads.test.ts`
- Create: `utils/signal-threads.ts`

- [ ] **Step 1: Add failing resolver tests**

Append this import to `tests/signal-threads.test.ts`:

```ts
import { createSignalThreadCards } from '../utils/signal-threads'
```

Append this test block to `tests/signal-threads.test.ts`:

```ts
describe('createSignalThreadCards', () => {
  const radarItems = [
    {
      id: 1,
      url: 'https://cursor.com/',
      title: 'Cursor: AI coding agent',
      source: 'grounding',
      topic_slug: 'coding-agents',
      category: 'coding',
      relevance: 10,
      score: 0,
      created_at: '2026-06-18 13:32:55',
    },
    {
      id: 2,
      url: 'https://kiro.dev/',
      title: 'Kiro: Move beyond AI coding to agentic engineering',
      source: 'grounding',
      topic_slug: 'coding-agents',
      category: 'coding',
      relevance: 10,
      score: 0,
      created_at: '2026-06-18 13:32:54',
    },
  ]

  it('localizes thread cards and resolves supporting signals by URL', () => {
    const cards = createSignalThreadCards({
      threads: SIGNAL_RESEARCH_THREADS,
      items: radarItems,
      locale: 'en',
    })

    expect(cards[0]).toMatchObject({
      slug: 'coding-agents-own-workflows',
      title: 'Coding agents are becoming workflow owners',
      confidence: 'high',
      matchedSignals: [
        {
          id: 1,
          title: 'Cursor: AI coding agent',
          url: 'https://cursor.com/',
          source: 'grounding',
        },
        {
          id: 2,
          title: 'Kiro: Move beyond AI coding to agentic engineering',
          url: 'https://kiro.dev/',
          source: 'grounding',
        },
      ],
      unmatchedSignalCount: 1,
    })
  })

  it('returns Chinese copy when locale is zh', () => {
    const cards = createSignalThreadCards({
      threads: SIGNAL_RESEARCH_THREADS.slice(0, 1),
      items: radarItems,
      locale: 'zh',
    })

    expect(cards[0].title).toBe('Coding agents 正在变成工作流负责人')
    expect(cards[0].builderImplication).toContain('构建者')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts
```

Expected: FAIL because `../utils/signal-threads` does not exist.

- [ ] **Step 3: Create resolver utility**

Create `utils/signal-threads.ts` with this content:

```ts
import type {
  SignalLocale,
  SignalResearchThread,
  SignalThreadConfidence,
  SignalThreadRef,
} from '../data/signal/threads'

export type SignalThreadRadarItem = {
  id: number | string
  url: string
  title: string
  source: string
  topic_slug?: string
  category?: string
  relevance?: number | string
  score?: number | string | null
  created_at?: string
}

export type SignalThreadMatchedSignal = {
  id: number | string
  title: string
  url: string
  source: string
  topicSlug?: string
  note: string
}

export type SignalThreadCard = {
  slug: string
  title: string
  thesis: string
  builderImplication: string
  confidence: SignalThreadConfidence
  lastUpdated: string
  openQuestion: string
  productHypothesis: string
  matchedSignals: SignalThreadMatchedSignal[]
  unmatchedSignalCount: number
}

function normalizedLocale(locale: string): SignalLocale {
  return locale === 'zh' ? 'zh' : 'en'
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''
    url.searchParams.sort()
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim().replace(/\/$/, '')
  }
}

function localized(ref: SignalThreadRef, locale: SignalLocale) {
  return ref.note[locale] || ref.note.en
}

function matchSignal(ref: SignalThreadRef, itemsByUrl: Map<string, SignalThreadRadarItem>) {
  return itemsByUrl.get(normalizeUrl(ref.url))
}

export function createSignalThreadCards({
  threads,
  items,
  locale,
}: {
  threads: SignalResearchThread[]
  items: SignalThreadRadarItem[]
  locale: string
}): SignalThreadCard[] {
  const signalLocale = normalizedLocale(locale)
  const itemsByUrl = new Map(items.map((item) => [normalizeUrl(item.url), item]))

  return threads.map((thread) => {
    const matchedSignals = thread.signalRefs.flatMap((ref) => {
      const item = matchSignal(ref, itemsByUrl)
      if (!item) return []

      return [
        {
          id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
          topicSlug: item.topic_slug,
          note: localized(ref, signalLocale),
        },
      ]
    })

    return {
      slug: thread.slug,
      title: thread.title[signalLocale] || thread.title.en,
      thesis: thread.thesis[signalLocale] || thread.thesis.en,
      builderImplication: thread.builderImplication[signalLocale] || thread.builderImplication.en,
      confidence: thread.confidence,
      lastUpdated: thread.lastUpdated,
      openQuestion: thread.openQuestion[signalLocale] || thread.openQuestion.en,
      productHypothesis: thread.productHypothesis[signalLocale] || thread.productHypothesis.en,
      matchedSignals,
      unmatchedSignalCount: thread.signalRefs.length - matchedSignals.length,
    }
  })
}
```

- [ ] **Step 4: Run the resolver tests to verify they pass**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add tests/signal-threads.test.ts utils/signal-threads.ts
git commit -m "feat(signal): resolve research threads against radar items"
```

---

### Task 3: Render What I'm Watching on Signal Page

**Files:**

- Create: `components/signal/ResearchThreads.vue`
- Modify: `pages/signal.vue`
- Modify: `i18n/locales/en-US.json`
- Modify: `i18n/locales/zh-CN.json`
- Modify: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Add failing contract tests**

In `tests/radar/static-signal-contract.test.js`, add these constants after the existing `MAIN_SIGNAL` constant:

```js
const SIGNAL_RESEARCH_THREADS = readFileSync(
  new URL('../../components/signal/ResearchThreads.vue', import.meta.url),
  'utf8',
)
const EN_LOCALE = readFileSync(new URL('../../i18n/locales/en-US.json', import.meta.url), 'utf8')
const ZH_LOCALE = readFileSync(new URL('../../i18n/locales/zh-CN.json', import.meta.url), 'utf8')
```

Add this test before the test named `allows Signal routes to be prerendered`:

```js
it('renders Signal research threads from static editorial data', () => {
  expect(SIGNAL_PAGE).toContain("import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'")
  expect(SIGNAL_PAGE).toContain("import { createSignalThreadCards } from '~/utils/signal-threads'")
  expect(SIGNAL_PAGE).toContain('const threadCards = computed')
  expect(SIGNAL_PAGE).toContain('<SignalResearchThreads')
  expect(SIGNAL_RESEARCH_THREADS).toContain('What I\\'m Watching')
  expect(SIGNAL_RESEARCH_THREADS).toContain('matchedSignals')
  expect(EN_LOCALE).toContain('"watchingTitle": "What I\\'m Watching"')
  expect(ZH_LOCALE).toContain('"watchingTitle": "我正在关注"')
})
```

- [ ] **Step 2: Run the contract test to verify it fails**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected: FAIL because `components/signal/ResearchThreads.vue` does not exist and `/signal` does not import the thread layer.

- [ ] **Step 3: Create `SignalResearchThreads` component**

Create `components/signal/ResearchThreads.vue` with this content:

```vue
<script setup lang="ts">
import type { SignalThreadCard } from '~/utils/signal-threads'

defineProps<{
  threads: SignalThreadCard[]
  heading: string
  description: string
  confidenceLabel: string
  supportingSignalsLabel: string
  moreSignalsLabel: string
  openQuestionLabel: string
  productHypothesisLabel: string
}>()
</script>

<template>
  <section v-if="threads.length > 0" class="mb-8">
    <div class="mb-4">
      <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
        Signal Research
      </p>
      <h2 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {{ heading || "What I'm Watching" }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-muted-foreground/70 leading-relaxed">
        {{ description }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article
        v-for="thread in threads"
        :key="thread.slug"
        class="rounded-lg border border-border/60 bg-card/70 p-4 transition-colors hover:border-cyan-500/30"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-base font-semibold leading-snug text-foreground">
            {{ thread.title }}
          </h3>
          <span
            class="shrink-0 rounded-md bg-secondary px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground"
          >
            {{ confidenceLabel }}: {{ thread.confidence }}
          </span>
        </div>

        <p class="mt-2 text-sm text-muted-foreground/75 leading-relaxed">
          {{ thread.thesis }}
        </p>

        <p class="mt-3 text-xs text-foreground/80 leading-relaxed">
          {{ thread.builderImplication }}
        </p>

        <div v-if="thread.matchedSignals.length > 0" class="mt-4">
          <p class="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45">
            {{ supportingSignalsLabel }}
          </p>
          <div class="flex flex-col gap-2">
            <a
              v-for="signal in thread.matchedSignals.slice(0, 3)"
              :key="signal.id"
              :href="signal.url"
              target="_blank"
              rel="noopener"
              class="group rounded-md border border-border/40 px-3 py-2 hover:bg-secondary/60"
            >
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span
                  class="line-clamp-1 text-xs font-medium text-foreground/80 group-hover:text-foreground"
                >
                  {{ signal.title }}
                </span>
              </div>
              <p class="mt-1 line-clamp-2 text-[11px] text-muted-foreground/55">
                {{ signal.note }}
              </p>
            </a>
          </div>
          <p
            v-if="thread.unmatchedSignalCount > 0"
            class="mt-2 text-[11px] text-muted-foreground/45"
          >
            +{{ thread.unmatchedSignalCount }} {{ moreSignalsLabel }}
          </p>
        </div>

        <div class="mt-4 space-y-2 border-t border-border/40 pt-3">
          <p class="text-[11px] text-muted-foreground/70">
            <span class="font-semibold text-foreground/70">{{ openQuestionLabel }}:</span>
            {{ thread.openQuestion }}
          </p>
          <p class="text-[11px] text-muted-foreground/70">
            <span class="font-semibold text-foreground/70">{{ productHypothesisLabel }}:</span>
            {{ thread.productHypothesis }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Add Signal i18n keys**

In `i18n/locales/en-US.json`, inside the existing `"signal"` object, add these keys after `"subtitle"`:

```json
"researchDesk": "Public research desk for AI-native work.",
"researchDeskDescription": "Signal tracks the public sources I use to understand coding agents, AI-native workflows, small-team automation, and product opportunities. Raw links are evidence; threads and briefs are my interpretation.",
"watchingTitle": "What I'm Watching",
"watchingDescription": "The research threads I am actively testing against the feed. Each thread turns repeated signals into a working thesis, an open question, and a possible product direction.",
"confidence": "Confidence",
"supportingSignals": "Supporting signals",
"moreSignals": "more supporting signals",
"openQuestion": "Open question",
"productHypothesis": "Product hypothesis",
```

In `i18n/locales/zh-CN.json`, inside the existing `"signal"` object, add these keys after `"subtitle"`:

```json
"researchDesk": "AI 原生工作的公开研究台。",
"researchDeskDescription": "Signal 追踪我用来理解 coding agents、AI 原生工作流、小团队自动化和产品机会的公开来源。原始链接是证据；threads 和 briefs 是我的判断。",
"watchingTitle": "我正在关注",
"watchingDescription": "这些是我正在用 feed 验证的研究线索。每条 thread 都把重复出现的信号转成一个工作假设、一个开放问题和一个可能的产品方向。",
"confidence": "置信度",
"supportingSignals": "支撑信号",
"moreSignals": "条更多支撑信号",
"openQuestion": "开放问题",
"productHypothesis": "产品假设",
```

- [ ] **Step 5: Wire thread data into `/signal`**

In `pages/signal.vue`, add these imports after the existing imports:

```ts
import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'
import { createSignalThreadCards } from '~/utils/signal-threads'
```

Replace:

```ts
const { t } = useI18n()
```

with:

```ts
const { t, locale } = useI18n()
```

Add this computed value after the `totalStats` computed block:

```ts
const threadCards = computed(() =>
  createSignalThreadCards({
    threads: SIGNAL_RESEARCH_THREADS,
    items: allItems.value,
    locale: locale.value,
  }),
)
```

Replace the hero subtitle copy:

```vue
<p class="text-lg text-muted-foreground max-w-lg">
  {{ t('signal.subtitle') }}
</p>
<p class="text-sm text-muted-foreground/50 mt-3 max-w-lg leading-relaxed">
  {{ t('signal.poweredBy') }}
</p>
```

with:

```vue
<p class="text-lg text-muted-foreground max-w-lg">
  {{ t('signal.researchDesk') }}
</p>
<p class="text-sm text-muted-foreground/50 mt-3 max-w-lg leading-relaxed">
  {{ t('signal.researchDeskDescription') }}
</p>
```

Insert this block immediately after the Today's Pulse block and before the toolbar:

```vue
<SignalResearchThreads
  :threads="threadCards"
  :heading="t('signal.watchingTitle')"
  :description="t('signal.watchingDescription')"
  :confidence-label="t('signal.confidence')"
  :supporting-signals-label="t('signal.supportingSignals')"
  :more-signals-label="t('signal.moreSignals')"
  :open-question-label="t('signal.openQuestion')"
  :product-hypothesis-label="t('signal.productHypothesis')"
/>
```

- [ ] **Step 6: Run the contract and resolver tests**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts tests/radar/static-signal-contract.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add components/signal/ResearchThreads.vue pages/signal.vue i18n/locales/en-US.json i18n/locales/zh-CN.json tests/radar/static-signal-contract.test.js
git commit -m "feat(signal): render research threads"
```

---

### Task 4: Update Homepage Signal Framing

**Files:**

- Modify: `components/main/signal.vue`
- Modify: `i18n/locales/en-US.json`
- Modify: `i18n/locales/zh-CN.json`
- Modify: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Add failing homepage contract checks**

In the `renders Signal research threads from static editorial data` test from Task 3, append:

```js
expect(MAIN_SIGNAL).toContain("t('signal.previewDescription')")
expect(EN_LOCALE).toContain(
  '"previewDescription": "Daily signals from my AI-native product research desk."',
)
expect(ZH_LOCALE).toContain('"previewDescription": "来自我的 AI 原生产品研究台的每日信号。"')
```

- [ ] **Step 2: Run the contract test to verify it fails**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected: FAIL because the homepage card does not render `signal.previewDescription`.

- [ ] **Step 3: Add homepage preview copy**

In `i18n/locales/en-US.json`, inside `"signal"`, add:

```json
"previewDescription": "Daily signals from my AI-native product research desk.",
```

In `i18n/locales/zh-CN.json`, inside `"signal"`, add:

```json
"previewDescription": "来自我的 AI 原生产品研究台的每日信号。",
```

- [ ] **Step 4: Render the preview copy in `components/main/signal.vue`**

In `components/main/signal.vue`, inside the header left group, replace:

```vue
<span
  class="text-[10px] font-mono uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent select-none"
>
  {{ t('navigation.signal') }}
</span>
```

with:

```vue
<div class="flex flex-col">
  <span
    class="text-[10px] font-mono uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent select-none"
  >
    {{ t('navigation.signal') }}
  </span>
  <span class="text-[10px] text-muted-foreground/45 leading-tight">
    {{ t('signal.previewDescription') }}
  </span>
</div>
```

- [ ] **Step 5: Run the contract test**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add components/main/signal.vue i18n/locales/en-US.json i18n/locales/zh-CN.json tests/radar/static-signal-contract.test.js
git commit -m "feat(signal): frame preview as research desk"
```

---

### Task 5: Add First Signal Brief Posts

**Files:**

- Create: `content/blogs/en/26.signal-brief-ai-native-work-2026-06-21.md`
- Create: `content/blogs/zh/26.signal-brief-ai-native-work-2026-06-21.md`

- [ ] **Step 1: Create the English Signal Brief**

Create `content/blogs/en/26.signal-brief-ai-native-work-2026-06-21.md` with this content:

```md
---
title: 'Signal Brief: Coding Agents Are Becoming Workflow Owners'
date: 21st Jun 2026
description: 'This first Signal Brief turns this week’s coding-agent signals into a working thesis: the category is moving from coding assistance toward workflow ownership.'
image: /blogs-img/blog.jpg
alt: Signal Brief on AI-native work
ogImage: /blogs-img/blog.jpg
tags: ['AI', 'Signal', 'Coding Agents', 'AI Native Work']
category: ai-native-systems
published: true
---

This is the first Signal Brief.

The goal is simple: take the signals I am already tracking and turn them into a sharper read on what may matter for builders.

## The strongest signal

Coding agents are being framed less like smarter autocomplete and more like work surfaces.

Cursor, Kiro, and the broader agentic IDE category all point in the same direction: the interesting product surface is no longer only the editor. It is task handoff, repo context, review, memory, and proof that the work is real.

## The pattern behind it

The category is moving from assistance to ownership.

That does not mean agents should run without boundaries. It means the unit of work is getting larger. A developer is no longer asking for one completion or one function. They are increasingly delegating a scoped task and expecting the system to plan, edit, check, and report back.

## Why it matters for builders

This changes what builders need to design.

The scarce skill is not only prompting. It is designing the operating contract around the agent:

- What can it read?
- What can it change?
- When should it stop?
- What evidence proves it finished?
- How does a human review the result without redoing the work?

The better the agents get, the more important these boundaries become.

## What I am skeptical about

I am skeptical of demos that make agentic work look frictionless.

Real work has messy context, unclear constraints, repo-specific judgment, and review cost. The category will not be won only by the model that writes the most code. It will be won by systems that make delegated work legible, checkable, and reversible.

## What I might build because of this

The product hypothesis is an Agent Operating Contract.

It could start as a simple set of templates and review workflows for builders and small teams:

- Define the task.
- Set authority boundaries.
- Create checkpoints.
- Require evidence.
- Review the result.
- Capture lessons for the next run.

That is small enough to test, but valuable enough to become a real product surface.
```

- [ ] **Step 2: Create the Chinese Signal Brief**

Create `content/blogs/zh/26.signal-brief-ai-native-work-2026-06-21.md` with this content:

```md
---
title: 'Signal Brief：Coding agents 正在变成工作流负责人'
date: 21st Jun 2026
description: '第一篇 Signal Brief 把本周 coding-agent 信号转成一个工作假设：这个类别正在从编码辅助走向工作流 ownership。'
image: /blogs-img/blog.jpg
alt: 关于 AI 原生工作的 Signal Brief
ogImage: /blogs-img/blog.jpg
tags: ['AI', 'Signal', 'Coding Agents', 'AI 原生工作']
category: ai-native-systems
published: true
---

这是第一篇 Signal Brief。

它的目标很简单：把我已经在追踪的 signal，转成一个更清楚的判断，帮助我和读者一起看见什么可能真的重要。

## 最强的信号

Coding agents 正在被重新定义。它们不再只是更聪明的 autocomplete，而是开始变成一种工作界面。

Cursor、Kiro，以及整个 agentic IDE 类别都在指向同一个方向：真正重要的产品界面不只是 editor，而是任务交接、仓库上下文、review、memory，以及证明工作真的完成的 evidence。

## 背后的模式

这个类别正在从 assistance 走向 ownership。

这不代表 agent 应该无边界地自己乱跑。它代表工作单位正在变大。开发者不再只是要一个 completion 或一个 function，而是在委托一个有范围的任务，并期待系统能计划、修改、检查、汇报。

## 为什么这对 builders 重要

这会改变 builders 需要设计的东西。

稀缺能力不只是 prompt，而是为 agent 设计 operating contract：

- 它能读什么？
- 它能改什么？
- 它什么时候应该停？
- 什么证据能证明它完成了？
- 人怎么 review，而不是重新做一遍？

Agent 越强，这些边界越重要。

## 我保持怀疑的地方

我对那些让 agentic work 看起来完全无摩擦的 demo 保持怀疑。

真实工作里有混乱的上下文、不清晰的限制、仓库特有的判断，以及 review 成本。这个类别不会只由最会写代码的模型赢。它会由那些能让委托工作变得可读、可检查、可回滚的系统赢。

## 我可能因此构建什么

这里的产品假设是 Agent Operating Contract。

它可以先从一组简单模板和 review 工作流开始，服务 builders 和小团队：

- 定义任务。
- 设定权限边界。
- 创建检查点。
- 要求 evidence。
- Review 结果。
- 把经验沉淀进下一次 run。

这足够小，可以测试；也足够有价值，可以慢慢变成真正的产品界面。
```

- [ ] **Step 3: Run content smoke tests**

Run:

```bash
pnpm exec vitest run tests/type-guards.test.ts tests/blog-taxonomy.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add content/blogs/en/26.signal-brief-ai-native-work-2026-06-21.md content/blogs/zh/26.signal-brief-ai-native-work-2026-06-21.md
git commit -m "content: publish first Signal Brief"
```

---

### Task 6: Full Verification

**Files:**

- Verify all changed files.

- [ ] **Step 1: Run focused Signal tests**

Run:

```bash
pnpm exec vitest run tests/signal-threads.test.ts tests/radar/static-signal-contract.test.js
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
pnpm exec vitest run
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 4: Run static generation**

Run:

```bash
pnpm run generate
```

Expected: PASS and generated `/signal` without prerender errors.

If `pnpm run generate` fails at `npm rebuild better-sqlite3` with local native rebuild/cache errors, run:

```bash
npm rebuild better-sqlite3
pnpm run generate
```

Expected: PASS after native dependency rebuild succeeds.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only Signal 2.0 implementation files are changed after the task commits.

- [ ] **Step 6: Confirm no verification-only changes remain**

Run:

```bash
git status --short
```

Expected: no output. If verification changed tracked files, inspect those exact paths and either commit them with a task-specific message or revert generated artifacts that should not be checked in.
