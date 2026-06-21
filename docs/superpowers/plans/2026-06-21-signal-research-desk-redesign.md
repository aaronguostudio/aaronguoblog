# Signal Research Desk Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/signal` into a wider Live Research Desk product page while preserving the current static Radar data flow, filters, Signal Brief separation, and pre-render behavior.

**Architecture:** Keep `pages/signal.vue` as the data coordinator and move major presentation surfaces into focused Signal components. Add a `SignalHero` component for the research desk first screen and a `SignalPulse` component for the daily readout. Upgrade existing research-thread, brief, and feed markup without changing Radar ingestion or the Signal editorial data model.

**Tech Stack:** Nuxt 3, Vue SFCs, TypeScript, Tailwind CSS, vue-i18n JSON locale files, Vitest contract tests, existing static Radar snapshot composable.

---

## File Structure

- Create `components/signal/Hero.vue`
  - Renders the wider research desk hero, live status, promise bullets, metrics, and source mix panel.
  - Receives fully formatted presentation data from `pages/signal.vue`.

- Create `components/signal/Pulse.vue`
  - Renders Today's Pulse as a daily research-desk readout.
  - Receives formatted pulse cards from `pages/signal.vue`.

- Modify `pages/signal.vue`
  - Keeps fetching, filtering, static snapshot fallback, helper functions, and computed data.
  - Computes hero metrics, source mix rows, pulse cards, and evidence section text.
  - Uses `SignalHero` and `SignalPulse`.
  - Expands the page shell from `max-w-5xl` to a wider product surface.

- Modify `components/signal/ResearchThreads.vue`
  - Upgrades the visual hierarchy for the main insight layer.
  - Keeps props and data contract unchanged.

- Modify `components/signal/Briefs.vue`
  - Upgrades the latest brief into an editorial memo surface.
  - Keeps props and data contract unchanged.

- Modify `i18n/locales/en-US.json`
  - Adds research desk hero, operations, pulse, and evidence feed copy.

- Modify `i18n/locales/zh-CN.json`
  - Adds matching Chinese copy with natural product-language phrasing.

- Modify `tests/radar/static-signal-contract.test.js`
  - Adds contract checks for the new Signal page component boundaries and locale keys.
  - Keeps the existing Signal Brief out-of-Writing checks.

---

## Task 1: Add Contract Coverage for the Redesigned Signal Surface

**Files:**

- Modify: `tests/radar/static-signal-contract.test.js`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Add component file constants**

Add these constants near the existing Signal component constants:

```js
const SIGNAL_HERO_COMPONENT = new URL('../../components/signal/Hero.vue', import.meta.url)
const SIGNAL_PULSE_COMPONENT = new URL('../../components/signal/Pulse.vue', import.meta.url)
```

- [ ] **Step 2: Add a failing contract test**

Add this test before the existing "keeps Signal Briefs out of Writing" test:

```js
it('renders Signal as a wider research desk product surface', () => {
  expect(existsSync(SIGNAL_HERO_COMPONENT)).toBe(true)
  expect(existsSync(SIGNAL_PULSE_COMPONENT)).toBe(true)
  expect(SIGNAL_PAGE).toContain('<SignalHero')
  expect(SIGNAL_PAGE).toContain('<SignalPulse')
  expect(SIGNAL_PAGE).toContain('const heroMetrics = computed')
  expect(SIGNAL_PAGE).toContain('const sourceMixRows = computed')
  expect(SIGNAL_PAGE).toContain('const pulseCards = computed')
  expect(SIGNAL_PAGE).toContain('max-w-7xl')

  const signalHeroComponent = readFileSync(SIGNAL_HERO_COMPONENT, 'utf8')
  const signalPulseComponent = readFileSync(SIGNAL_PULSE_COMPONENT, 'utf8')

  expect(signalHeroComponent).toContain('operationsLabel')
  expect(signalHeroComponent).toContain('sourceMixRows')
  expect(signalHeroComponent).toContain('metrics')
  expect(signalPulseComponent).toContain('pulseCards')
  expect(signalPulseComponent).toContain('dailyReadoutLabel')

  expect(EN_LOCALE).toContain('"heroEyebrow": "Live research desk"')
  expect(EN_LOCALE).toContain('"evidenceTitle": "Evidence Feed"')
  expect(ZH_LOCALE).toContain('"heroEyebrow": "实时研究台"')
  expect(ZH_LOCALE).toContain('"evidenceTitle": "证据流"')
})
```

- [ ] **Step 3: Run the focused contract test and confirm it fails**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected result: FAIL because `components/signal/Hero.vue` and `components/signal/Pulse.vue` do not exist yet.

---

## Task 2: Add Signal Hero and Pulse Components

**Files:**

- Create: `components/signal/Hero.vue`
- Create: `components/signal/Pulse.vue`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Create `components/signal/Hero.vue`**

Create this component:

```vue
<script setup lang="ts">
type SignalHeroMetric = {
  label: string
  value: string
  caption: string
}

type SignalHeroSourceRow = {
  source: string
  label: string
  count: string
  percent: number
  colorClass: string
}

defineProps<{
  title: string
  eyebrow: string
  description: string
  statusLabel: string
  liveLabel: string
  operationsLabel: string
  sourceMixLabel: string
  pulseDateLabel: string
  pulseDate?: string | null
  promises: string[]
  metrics: SignalHeroMetric[]
  sourceMixRows: SignalHeroSourceRow[]
}>()
</script>

<template>
  <section class="relative overflow-hidden border-b border-border/60 py-8 sm:py-12 lg:py-14">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:items-start">
      <div class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <span class="rounded-md border border-border/70 bg-background px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            {{ eyebrow }}
          </span>
          <span class="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {{ liveLabel }}
          </span>
        </div>

        <h1 class="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {{ title }}
        </h1>

        <p class="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {{ description }}
        </p>

        <div class="mt-7 grid gap-3 sm:grid-cols-3">
          <div
            v-for="promise in promises"
            :key="promise"
            class="border-l border-border/80 pl-3 text-sm leading-relaxed text-muted-foreground/80"
          >
            {{ promise }}
          </div>
        </div>
      </div>

      <aside class="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <div class="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/55">
              {{ operationsLabel }}
            </p>
            <p class="mt-1 text-sm font-medium text-foreground">
              {{ statusLabel }}
            </p>
          </div>
          <div v-if="pulseDate" class="text-right">
            <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45">
              {{ pulseDateLabel }}
            </p>
            <p class="mt-1 text-xs font-mono text-muted-foreground">
              {{ pulseDate }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-3">
          <div v-for="metric in metrics" :key="metric.label" class="min-w-0">
            <p class="text-2xl font-semibold tracking-tight text-foreground">
              {{ metric.value }}
            </p>
            <p class="mt-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50">
              {{ metric.label }}
            </p>
            <p class="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground/55">
              {{ metric.caption }}
            </p>
          </div>
        </div>

        <div v-if="sourceMixRows.length > 0" class="mt-5 border-t border-border/50 pt-4">
          <p class="mb-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/55">
            {{ sourceMixLabel }}
          </p>
          <div class="space-y-2">
            <div v-for="row in sourceMixRows" :key="row.source" class="grid grid-cols-[2.5rem_1fr_4.5rem] items-center gap-2">
              <span class="text-right text-[11px] font-mono text-muted-foreground/65">{{ row.count }}</span>
              <div class="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div class="h-full rounded-full" :class="row.colorClass" :style="{ width: `${row.percent}%` }" />
              </div>
              <span class="truncate text-[11px] font-mono text-muted-foreground/65">
                {{ row.label }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create `components/signal/Pulse.vue`**

Create this component:

```vue
<script setup lang="ts">
type SignalPulseCard = {
  id: string
  url: string
  title: string
  sourceLabel: string
  categoryLabel: string
  sourceClass: string
  categoryClass: string
}

defineProps<{
  pulseText: string | null
  pulseDate: string | null
  dailyReadoutLabel: string
  heading: string
  description: string
  evidenceLabel: string
  pulseCards: SignalPulseCard[]
}>()
</script>

<template>
  <section v-if="pulseText" class="py-8">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div class="border-l border-cyan-500/40 pl-4">
        <p class="text-[11px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
          {{ dailyReadoutLabel }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {{ heading }}
        </h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground/70">
          {{ description }}
        </p>
        <p v-if="pulseDate" class="mt-4 text-[11px] font-mono text-muted-foreground/45">
          {{ pulseDate }}
        </p>
      </div>

      <article class="rounded-lg border border-border/70 bg-card/75 p-4 sm:p-5">
        <p class="text-base leading-relaxed text-foreground sm:text-lg">
          {{ pulseText }}
        </p>

        <div v-if="pulseCards.length > 0" class="mt-5 border-t border-border/50 pt-4">
          <p class="mb-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {{ evidenceLabel }}
          </p>
          <div class="divide-y divide-border/45">
            <a
              v-for="item in pulseCards"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener"
              class="group grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span class="flex min-w-0 items-center gap-2.5">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="item.sourceClass" />
                <span class="line-clamp-2 text-sm font-medium leading-snug text-foreground/75 group-hover:text-foreground">
                  {{ item.title }}
                </span>
              </span>
              <span class="flex items-center gap-2 sm:justify-end">
                <span class="text-[10px] font-mono text-muted-foreground/45">{{ item.sourceLabel }}</span>
                <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold" :class="item.categoryClass">
                  {{ item.categoryLabel }}
                </span>
              </span>
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Run the focused contract test**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected result: still FAIL because `pages/signal.vue` and locale files do not reference the new components and keys yet.

---

## Task 3: Wire the New Components into `/signal`

**Files:**

- Modify: `pages/signal.vue`
- Modify: `i18n/locales/en-US.json`
- Modify: `i18n/locales/zh-CN.json`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Add presentation computed values to `pages/signal.vue`**

Add these computed values after `totalStats`:

```ts
const sourceMixRows = computed(() => {
  const total = Number(totalStats.value) || 0
  return (statsData.value || []).slice(0, 8).map((stat) => {
    const count = Number(stat.count) || 0
    return {
      source: stat.source,
      label: sourceLabel(stat.source),
      count: String(count),
      percent: total > 0 ? Math.max(4, Math.round((count / total) * 100)) : 4,
      colorClass: sourceBg(stat.source),
    }
  })
})

const heroMetrics = computed(() => [
  {
    label: t('signal.metricSignals'),
    value: String(totalStats.value || totalCount.value || 0),
    caption: t('signal.metricSignalsCaption'),
  },
  {
    label: t('signal.metricThreads'),
    value: String(threadCards.value.length),
    caption: t('signal.metricThreadsCaption'),
  },
  {
    label: t('signal.metricBriefs'),
    value: String(briefCards.value.length),
    caption: t('signal.metricBriefsCaption'),
  },
])

const heroStatusLabel = computed(() => {
  if (latestRun.value?.completed_at || latestRun.value?.started_at) {
    return `${t('signal.updated')} ${timeAgo(latestRun.value.completed_at || latestRun.value.started_at || '')}`
  }
  return t('signal.snapshotReady')
})

const heroPromises = computed(() => [
  t('signal.heroPromiseEvidence'),
  t('signal.heroPromiseInterpretation'),
  t('signal.heroPromiseProducts'),
])

const pulseCards = computed(() =>
  pulseItems.value.map((item) => ({
    id: String(item.id),
    url: item.url,
    title: stripHtml(item.title),
    sourceLabel: sourceLabel(item.source),
    categoryLabel: categoryLabel(item.category),
    sourceClass: sourceBg(item.source),
    categoryClass: categoryColor(item.category),
  })),
)
```

- [ ] **Step 2: Replace the page shell, hero, and pulse markup**

Change the opening template shell to:

```vue
<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <SignalHero
      :title="t('signal.title')"
      :eyebrow="t('signal.heroEyebrow')"
      :description="t('signal.researchDeskDescription')"
      :status-label="heroStatusLabel"
      :live-label="t('signal.liveLabel')"
      :operations-label="t('signal.operationsLabel')"
      :source-mix-label="t('signal.sourceMixLabel')"
      :pulse-date-label="t('signal.pulseDateLabel')"
      :pulse-date="pulseDate"
      :promises="heroPromises"
      :metrics="heroMetrics"
      :source-mix-rows="sourceMixRows"
    />

    <SignalPulse
      :pulse-text="pulseText"
      :pulse-date="pulseDate"
      :daily-readout-label="t('signal.dailyReadoutLabel')"
      :heading="t('signal.todaysPulse')"
      :description="t('signal.pulseDescription')"
      :evidence-label="t('signal.pulseEvidenceLabel')"
      :pulse-cards="pulseCards"
    />
```

Remove the old inline hero block and old inline Today's Pulse block.

- [ ] **Step 3: Wrap the raw feed in an Evidence Feed section**

Place this opening block immediately before the toolbar:

```vue
    <section class="mt-12 border-t border-border/70 pt-8">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {{ t('signal.evidenceEyebrow') }}
          </p>
          <h2 class="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {{ t('signal.evidenceTitle') }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/70">
            {{ t('signal.evidenceDescription') }}
          </p>
        </div>
      </div>
```

Close the section after the load-more block:

```vue
    </section>
  </main>
</template>
```

- [ ] **Step 4: Update toolbar classes**

Replace the toolbar wrapper class with:

```vue
class="sticky top-[5rem] z-40 -mx-2 mb-6 rounded-lg border border-border/60 bg-background/90 px-3 py-3 shadow-sm backdrop-blur-md sm:-mx-3 sm:px-4"
```

- [ ] **Step 5: Add English locale keys**

Inside the existing `signal` object in `i18n/locales/en-US.json`, add:

```json
"heroEyebrow": "Live research desk",
"liveLabel": "Live system",
"operationsLabel": "Desk status",
"sourceMixLabel": "Source mix",
"pulseDateLabel": "Pulse date",
"metricSignals": "Signals",
"metricSignalsCaption": "Raw public evidence in the current snapshot.",
"metricThreads": "Threads",
"metricThreadsCaption": "Active theses tested against the feed.",
"metricBriefs": "Briefs",
"metricBriefsCaption": "Editorial memos pulled from repeated signals.",
"snapshotReady": "Static snapshot ready",
"heroPromiseEvidence": "Raw links stay visible as evidence.",
"heroPromiseInterpretation": "Threads turn repeated signals into working theses.",
"heroPromiseProducts": "Briefs convert research into product hypotheses.",
"dailyReadoutLabel": "Today's readout",
"pulseDescription": "The daily pulse is the desk's short read on what the current feed is saying.",
"pulseEvidenceLabel": "Supporting signals",
"evidenceEyebrow": "Raw evidence",
"evidenceTitle": "Evidence Feed",
"evidenceDescription": "Search and filter the underlying links that support the daily pulse, research threads, and briefs."
```

- [ ] **Step 6: Add Chinese locale keys**

Inside the existing `signal` object in `i18n/locales/zh-CN.json`, add:

```json
"heroEyebrow": "实时研究台",
"liveLabel": "系统运行中",
"operationsLabel": "研究台状态",
"sourceMixLabel": "来源构成",
"pulseDateLabel": "Pulse 日期",
"metricSignals": "信号",
"metricSignalsCaption": "当前快照里的公开证据。",
"metricThreads": "研究线索",
"metricThreadsCaption": "正在用 feed 验证的工作假设。",
"metricBriefs": "Briefs",
"metricBriefsCaption": "从重复信号里整理出的研究备忘。",
"snapshotReady": "静态快照已就绪",
"heroPromiseEvidence": "原始链接保留为可检查的证据。",
"heroPromiseInterpretation": "研究线索把重复信号转成工作假设。",
"heroPromiseProducts": "Briefs 把研究转成产品假设。",
"dailyReadoutLabel": "今日读数",
"pulseDescription": "Daily Pulse 是研究台对当前 feed 的简短判断。",
"pulseEvidenceLabel": "支撑信号",
"evidenceEyebrow": "原始证据",
"evidenceTitle": "证据流",
"evidenceDescription": "搜索和筛选支撑 Daily Pulse、研究线索和 Briefs 的原始链接。"
```

- [ ] **Step 7: Run the focused contract test**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected result: PASS for the new component-boundary checks and existing Signal contracts.

---

## Task 4: Upgrade Research Threads and Brief Visual Hierarchy

**Files:**

- Modify: `components/signal/ResearchThreads.vue`
- Modify: `components/signal/Briefs.vue`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Update `ResearchThreads.vue` section shell**

Change the outer section and header classes to a wider, stronger insight layer:

```vue
<section v-if="threads.length > 0" class="py-8">
  <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
        Signal Research
      </p>
      <h2 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {{ heading || "What I'm Watching" }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-muted-foreground/70 leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
```

- [ ] **Step 2: Update research thread card treatment**

Use this card shell on each thread article:

```vue
class="flex min-h-full flex-col rounded-lg border border-border/70 bg-card/70 p-5 shadow-sm transition-colors hover:border-cyan-500/40"
```

Move the open question and product hypothesis block to the bottom by changing its wrapper to:

```vue
<div class="mt-auto space-y-2 border-t border-border/45 pt-4">
```

- [ ] **Step 3: Update `Briefs.vue` section shell**

Change the outer section to:

```vue
<section v-if="briefs.length > 0" class="py-8">
```

Change the article shell to:

```vue
class="rounded-lg border border-border/70 bg-card/75 p-5 shadow-sm sm:p-6"
```

- [ ] **Step 4: Update brief sections grid**

Replace the current brief section grid with:

```vue
<div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
  <section
    v-for="(section, index) in brief.sections"
    :key="section.heading"
    class="min-w-0 rounded-md border border-border/50 bg-background/55 p-4"
    :class="index < 2 ? 'lg:col-span-1' : ''"
  >
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js tests/signal-threads.test.ts
```

Expected result: PASS.

---

## Task 5: Polish Evidence Feed Rows Without Changing Behavior

**Files:**

- Modify: `pages/signal.vue`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Update item list container**

Replace:

```vue
<div v-else-if="allItems.length > 0" class="flex flex-col gap-4">
```

With:

```vue
<div v-else-if="allItems.length > 0" class="grid gap-3">
```

- [ ] **Step 2: Update item row class**

Replace the raw feed item anchor class with:

```vue
class="group block rounded-lg border border-border/60 border-l-2 bg-card/50 px-4 py-4 shadow-sm transition-colors duration-200 hover:bg-secondary/60"
```

Keep `:class="sourceColor(item.source)"` unchanged.

- [ ] **Step 3: Improve feed title and summary text classes**

Use:

```vue
<h3 class="text-base font-semibold leading-snug text-foreground group-hover:text-primary sm:text-lg">
```

And:

```vue
<p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground/55">
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
pnpm exec vitest run tests/radar/static-signal-contract.test.js
```

Expected result: PASS.

---

## Task 6: Full Verification and Commit

**Files:**

- Modified files from Tasks 1-5

- [ ] **Step 1: Format changed files**

Run:

```bash
pnpm exec prettier --write pages/signal.vue components/signal/Hero.vue components/signal/Pulse.vue components/signal/ResearchThreads.vue components/signal/Briefs.vue i18n/locales/en-US.json i18n/locales/zh-CN.json tests/radar/static-signal-contract.test.js
```

Expected result: Prettier writes or confirms the changed files.

- [ ] **Step 2: Run full tests**

Run:

```bash
pnpm exec vitest run
```

Expected result: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm run lint
```

Expected result: PASS.

- [ ] **Step 4: Run static generation**

Run:

```bash
pnpm run generate
```

Expected result: PASS. Existing warnings about duplicate blog route names or stale Browserslist data can be noted if they remain unchanged.

- [ ] **Step 5: Inspect git state**

Run:

```bash
git status -sb
git diff --stat
```

Expected result: Only the planned Signal redesign files are changed.

- [ ] **Step 6: Commit the implementation**

Run:

```bash
git add pages/signal.vue components/signal/Hero.vue components/signal/Pulse.vue components/signal/ResearchThreads.vue components/signal/Briefs.vue i18n/locales/en-US.json i18n/locales/zh-CN.json tests/radar/static-signal-contract.test.js
git commit -m "feat(signal): redesign research desk page"
```

Expected result: A local commit is created. Do not push.

---

## Self-Review

- Spec coverage: The plan implements the wider hero, operations/source mix panel, prominent pulse, redesigned research threads, redesigned briefs, evidence feed framing, locale copy, and verification steps.
- Scope control: The plan does not modify Radar ingestion, scoring, scheduled publishing, the static snapshot composable, Writing content collections, or deployment setup.
- Marker scan: No task contains unresolved markers or copy-paste shortcuts.
- Type consistency: `sourceMixRows`, `heroMetrics`, and `pulseCards` are defined in `pages/signal.vue` and consumed by `SignalHero`/`SignalPulse` with matching prop names.
