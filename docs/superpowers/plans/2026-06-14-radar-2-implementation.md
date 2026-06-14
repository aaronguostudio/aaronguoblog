# Radar 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scheduled Radar 2.0 ingestion pipeline powered by `last30days`, store normalized results in Turso, and make `/signal` consume Radar data without turning Radar output into blog posts.

**Architecture:** The implementation adds a repo-owned Node runner under `scripts/radar` that calls the Python `last30days` CLI through a narrow adapter, normalizes JSON into stable Radar records, writes idempotently to new Turso tables, and updates the existing Signal API/UI to read those tables. Radar jobs run outside Nuxt request handling through local commands and GitHub Actions.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript for server code, ESM Node scripts, Vitest, `@libsql/client`, GitHub Actions, Python 3.12+ for `last30days`.

---

## Scope Check

This is one integrated feature with several layers. Keep it as one plan because each task builds toward one working vertical path: topic config -> `last30days` adapter -> normalizer -> storage -> runner -> API -> UI -> schedule.

Do not add an admin UI in this implementation. Do not generate blog posts. Do not write Radar output into Nuxt Content.

## File Structure

Create:

- `scripts/radar/config.js`: topic definitions and topic selection helpers.
- `scripts/radar/url.js`: URL canonicalization for dedupe.
- `scripts/radar/source.js`: source label/color metadata shared by scripts and tests.
- `scripts/radar/normalizer.js`: convert `last30days` JSON into stable Radar item inputs.
- `scripts/radar/pulse.js`: deterministic daily pulse generation.
- `scripts/radar/last30days-adapter.js`: build and run the external `last30days` command.
- `scripts/radar/repository.js`: Turso schema discovery, migrations, and upserts.
- `scripts/radar/runner.js`: orchestrate one or many topic runs.
- `scripts/radar/cli.js`: command-line entry point for `pnpm radar:*`.
- `scripts/radar/schema.sql`: reviewed Radar table schema.
- `tests/radar/*.test.js`: focused unit tests for each script module.
- `tests/fixtures/last30days-mobile-ai.json`: stable fixture for normalizer tests.
- `server/utils/signal-radar.ts`: query builders and row mapping for Radar-backed Signal APIs.
- `.github/workflows/radar.yml`: scheduled and manual Radar workflow.
- `docs/RADAR.md`: operational documentation.

Modify:

- `package.json`: add `radar:run`, `radar:diagnose`, and `radar:migrate` scripts.
- `.env.example`: document Radar and Turso environment variables.
- `server/api/signal.get.ts`: read from Radar tables with controlled legacy fallback.
- `server/api/signal-pulse.get.ts`: read from Radar pulse table with controlled legacy fallback.
- `pages/signal.vue`: add topic filter, dynamic source labels, and freshness display.
- `components/main/signal.vue`: update source labels and copy behavior if needed.
- `i18n/locales/en-US.json`: update Signal copy.
- `i18n/locales/zh-CN.json`: update Signal copy.

## Task 1: Topic Config

**Files:**
- Create: `scripts/radar/config.js`
- Test: `tests/radar/config.test.js`

- [ ] **Step 1: Write the failing config tests**

Create `tests/radar/config.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  getDueRadarTopics,
  getRadarTopicBySlug,
  getRadarTopics,
  validateRadarTopic,
} from '../../scripts/radar/config.js'

describe('radar topic config', () => {
  it('contains the initial public topics', () => {
    const slugs = getRadarTopics().map(topic => topic.slug)

    expect(slugs).toEqual([
      'mobile-ai',
      'consumer-ai-apps',
      'ai-wearables',
      'coding-agents',
      'personal-ai-systems',
    ])
  })

  it('finds a topic by slug', () => {
    expect(getRadarTopicBySlug('mobile-ai')).toMatchObject({
      slug: 'mobile-ai',
      category: 'ai',
      cadence: 'daily',
      visibility: 'public',
    })
  })

  it('returns undefined for an unknown slug', () => {
    expect(getRadarTopicBySlug('unknown-topic')).toBeUndefined()
  })

  it('validates required fields with concrete errors', () => {
    const result = validateRadarTopic({
      slug: '',
      name: 'Broken',
      query: '',
      category: 'ai',
      cadence: 'hourly',
      mode: 'fast',
      lookbackDays: 0,
      visibility: 'public',
      minRelevance: 11,
    })

    expect(result).toEqual({
      ok: false,
      errors: [
        'slug must be a non-empty kebab-case string',
        'query must be a non-empty string',
        'cadence must be daily, weekly, or manual',
        'mode must be quick or deep',
        'lookbackDays must be an integer between 1 and 120',
        'minRelevance must be an integer between 1 and 10',
      ],
    })
  })

  it('selects due public daily topics', () => {
    const due = getDueRadarTopics({ cadence: 'daily' })

    expect(due.every(topic => topic.visibility === 'public')).toBe(true)
    expect(due.map(topic => topic.slug)).toContain('mobile-ai')
    expect(due.map(topic => topic.slug)).not.toContain('ai-wearables')
  })
})
```

- [ ] **Step 2: Run the config test to verify it fails**

Run:

```bash
pnpm vitest tests/radar/config.test.js --run
```

Expected: FAIL because `scripts/radar/config.js` does not exist.

- [ ] **Step 3: Add the topic config implementation**

Create `scripts/radar/config.js`:

```js
const ALLOWED_CADENCES = new Set(['daily', 'weekly', 'manual'])
const ALLOWED_MODES = new Set(['quick', 'deep'])
const ALLOWED_VISIBILITY = new Set(['public', 'private'])
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const TOPICS = [
  {
    slug: 'mobile-ai',
    name: 'Mobile AI',
    query: 'mobile AI, on-device AI, iOS Android AI assistants',
    category: 'ai',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['LocalLLaMA', 'ArtificialInteligence', 'singularity'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['mobileai', 'aiphone'],
      instagramCreators: [],
    },
  },
  {
    slug: 'consumer-ai-apps',
    name: 'Consumer AI Apps',
    query: 'consumer AI apps, AI productivity apps, AI app launches',
    category: 'ai',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['ArtificialInteligence', 'ChatGPT', 'productivity'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['aitools', 'aiapps'],
      instagramCreators: [],
    },
  },
  {
    slug: 'ai-wearables',
    name: 'AI Wearables',
    query: 'AI wearables, AI pins, voice-first AI devices, smart glasses AI',
    category: 'ai',
    cadence: 'weekly',
    mode: 'deep',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['wearables', 'gadgets', 'ArtificialInteligence'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['aiwearable', 'smartglasses'],
      instagramCreators: [],
    },
  },
  {
    slug: 'coding-agents',
    name: 'Coding Agents',
    query: 'coding agents, agentic IDEs, AI developer tools, autonomous coding',
    category: 'coding',
    cadence: 'daily',
    mode: 'quick',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 6,
    sourceHints: {
      subreddits: ['ClaudeAI', 'Cursor', 'LocalLLaMA', 'programming'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: [],
      instagramCreators: [],
    },
  },
  {
    slug: 'personal-ai-systems',
    name: 'Personal AI Systems',
    query: 'personal AI agents, AI memory, personal knowledge systems, intention-driven AI',
    category: 'ai',
    cadence: 'weekly',
    mode: 'deep',
    lookbackDays: 30,
    visibility: 'public',
    minRelevance: 5,
    sourceHints: {
      subreddits: ['PKMS', 'ObsidianMD', 'ArtificialInteligence'],
      githubRepos: [],
      xHandles: [],
      tiktokHashtags: ['personalai'],
      instagramCreators: [],
    },
  },
]

export function getRadarTopics() {
  return TOPICS.map(topic => ({
    ...topic,
    sourceHints: {
      subreddits: [...topic.sourceHints.subreddits],
      githubRepos: [...topic.sourceHints.githubRepos],
      xHandles: [...topic.sourceHints.xHandles],
      tiktokHashtags: [...topic.sourceHints.tiktokHashtags],
      instagramCreators: [...topic.sourceHints.instagramCreators],
    },
  }))
}

export function getRadarTopicBySlug(slug) {
  return getRadarTopics().find(topic => topic.slug === slug)
}

export function getDueRadarTopics({ cadence } = {}) {
  return getRadarTopics().filter(topic => {
    if (topic.visibility !== 'public') return false
    if (!cadence) return topic.cadence !== 'manual'
    return topic.cadence === cadence
  })
}

export function validateRadarTopic(topic) {
  const errors = []

  if (!topic.slug || !SLUG_PATTERN.test(topic.slug)) {
    errors.push('slug must be a non-empty kebab-case string')
  }
  if (!topic.name || typeof topic.name !== 'string') {
    errors.push('name must be a non-empty string')
  }
  if (!topic.query || typeof topic.query !== 'string') {
    errors.push('query must be a non-empty string')
  }
  if (!topic.category || typeof topic.category !== 'string') {
    errors.push('category must be a non-empty string')
  }
  if (!ALLOWED_CADENCES.has(topic.cadence)) {
    errors.push('cadence must be daily, weekly, or manual')
  }
  if (!ALLOWED_MODES.has(topic.mode)) {
    errors.push('mode must be quick or deep')
  }
  if (!Number.isInteger(topic.lookbackDays) || topic.lookbackDays < 1 || topic.lookbackDays > 120) {
    errors.push('lookbackDays must be an integer between 1 and 120')
  }
  if (!ALLOWED_VISIBILITY.has(topic.visibility)) {
    errors.push('visibility must be public or private')
  }
  if (!Number.isInteger(topic.minRelevance) || topic.minRelevance < 1 || topic.minRelevance > 10) {
    errors.push('minRelevance must be an integer between 1 and 10')
  }

  return { ok: errors.length === 0, errors }
}
```

- [ ] **Step 4: Run the config test to verify it passes**

Run:

```bash
pnpm vitest tests/radar/config.test.js --run
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add scripts/radar/config.js tests/radar/config.test.js
git commit -m "feat: add radar topic config"
```

## Task 2: URL and Source Utilities

**Files:**
- Create: `scripts/radar/url.js`
- Create: `scripts/radar/source.js`
- Test: `tests/radar/url.test.js`
- Test: `tests/radar/source.test.js`

- [ ] **Step 1: Write failing tests for URL canonicalization**

Create `tests/radar/url.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { canonicalizeUrl } from '../../scripts/radar/url.js'

describe('canonicalizeUrl', () => {
  it('removes tracking params, hashes, and trailing slash', () => {
    expect(canonicalizeUrl('https://Example.com/path/?utm_source=x&ref=share#section')).toBe('https://example.com/path')
  })

  it('keeps meaningful query params in sorted order', () => {
    expect(canonicalizeUrl('https://example.com/search?b=2&a=1&utm_medium=social')).toBe('https://example.com/search?a=1&b=2')
  })

  it('returns an empty string for invalid urls', () => {
    expect(canonicalizeUrl('not a url')).toBe('')
  })
})
```

Create `tests/radar/source.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { getSourceLabel, getSupportedSources } from '../../scripts/radar/source.js'

describe('source metadata', () => {
  it('labels known last30days sources', () => {
    expect(getSourceLabel('hackernews')).toBe('HN')
    expect(getSourceLabel('polymarket')).toBe('Polymarket')
    expect(getSourceLabel('youtube')).toBe('YouTube')
  })

  it('falls back to source id for unknown sources', () => {
    expect(getSourceLabel('new-source')).toBe('new-source')
  })

  it('includes legacy and last30days sources', () => {
    expect(getSupportedSources()).toEqual([
      'hackernews',
      'x-twitter',
      'reddit',
      'producthunt',
      'github',
      'lobsters',
      'arxiv',
      'youtube',
      'tiktok',
      'instagram',
      'polymarket',
      'web',
    ])
  })
})
```

- [ ] **Step 2: Run utility tests to verify they fail**

Run:

```bash
pnpm vitest tests/radar/url.test.js tests/radar/source.test.js --run
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Add URL utility implementation**

Create `scripts/radar/url.js`:

```js
const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'ref',
  'spm',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
])

export function canonicalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl)
    url.hash = ''
    url.hostname = url.hostname.toLowerCase()

    const keptParams = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b))

    url.search = ''
    for (const [key, value] of keptParams) {
      url.searchParams.append(key, value)
    }

    const asString = url.toString()
    return asString.endsWith('/') ? asString.slice(0, -1) : asString
  } catch {
    return ''
  }
}
```

- [ ] **Step 4: Add source utility implementation**

Create `scripts/radar/source.js`:

```js
export const SOURCE_META = {
  hackernews: { label: 'HN', colorClass: 'bg-orange-500', borderClass: 'border-l-orange-400' },
  'x-twitter': { label: 'X', colorClass: 'bg-foreground', borderClass: 'border-l-foreground' },
  reddit: { label: 'Reddit', colorClass: 'bg-purple-500', borderClass: 'border-l-purple-500' },
  producthunt: { label: 'PH', colorClass: 'bg-amber-500', borderClass: 'border-l-amber-500' },
  github: { label: 'GitHub', colorClass: 'bg-pink-500', borderClass: 'border-l-pink-500' },
  lobsters: { label: 'Lobsters', colorClass: 'bg-red-400', borderClass: 'border-l-red-400' },
  arxiv: { label: 'ArXiv', colorClass: 'bg-cyan-400', borderClass: 'border-l-cyan-400' },
  youtube: { label: 'YouTube', colorClass: 'bg-red-500', borderClass: 'border-l-red-500' },
  tiktok: { label: 'TikTok', colorClass: 'bg-sky-500', borderClass: 'border-l-sky-500' },
  instagram: { label: 'Instagram', colorClass: 'bg-fuchsia-500', borderClass: 'border-l-fuchsia-500' },
  polymarket: { label: 'Polymarket', colorClass: 'bg-blue-500', borderClass: 'border-l-blue-500' },
  web: { label: 'Web', colorClass: 'bg-emerald-500', borderClass: 'border-l-emerald-500' },
}

export function getSupportedSources() {
  return Object.keys(SOURCE_META)
}

export function getSourceLabel(source) {
  return SOURCE_META[source]?.label || source
}

export function getSourceColorClass(source) {
  return SOURCE_META[source]?.colorClass || 'bg-muted-foreground'
}

export function getSourceBorderClass(source) {
  return SOURCE_META[source]?.borderClass || 'border-l-muted-foreground'
}
```

- [ ] **Step 5: Run utility tests to verify they pass**

Run:

```bash
pnpm vitest tests/radar/url.test.js tests/radar/source.test.js --run
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add scripts/radar/url.js scripts/radar/source.js tests/radar/url.test.js tests/radar/source.test.js
git commit -m "feat: add radar utility helpers"
```

## Task 3: Normalizer

**Files:**
- Create: `scripts/radar/normalizer.js`
- Create: `tests/fixtures/last30days-mobile-ai.json`
- Test: `tests/radar/normalizer.test.js`

- [ ] **Step 1: Add the fixture**

Create `tests/fixtures/last30days-mobile-ai.json`:

```json
{
  "topic": "mobile AI, on-device AI, iOS Android AI assistants",
  "range_from": "2026-05-15",
  "range_to": "2026-06-14",
  "generated_at": "2026-06-14T14:00:00Z",
  "provider_runtime": {
    "reasoning_provider": "local",
    "planner_model": "fixture",
    "rerank_model": "fixture"
  },
  "query_plan": {
    "intent": "Track mobile AI discussion",
    "freshness_mode": "last30days",
    "cluster_mode": "topic",
    "raw_topic": "mobile AI",
    "subqueries": [],
    "source_weights": {}
  },
  "clusters": [
    {
      "cluster_id": "cluster-on-device",
      "title": "On-device assistants move from demos to daily workflows",
      "candidate_ids": ["candidate-1"],
      "representative_ids": ["candidate-1"],
      "sources": ["reddit"],
      "score": 44
    }
  ],
  "ranked_candidates": [
    {
      "candidate_id": "candidate-1",
      "item_id": "reddit-1",
      "source": "reddit",
      "title": "People are replacing simple phone workflows with local AI assistants",
      "url": "https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai/?utm_source=share#comments",
      "snippet": "Users describe local assistants handling voice notes and app actions.",
      "subquery_labels": ["mobile-ai"],
      "native_ranks": { "reddit": 1 },
      "local_relevance": 0.91,
      "freshness": 9,
      "engagement": 128,
      "source_quality": 0.82,
      "rrf_score": 0.12,
      "sources": ["reddit"],
      "source_items": [
        {
          "item_id": "reddit-1",
          "source": "reddit",
          "title": "People are replacing simple phone workflows with local AI assistants",
          "body": "Users describe local assistants handling voice notes and app actions.",
          "url": "https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai/?utm_source=share#comments",
          "author": "localbuilder",
          "container": "r/LocalLLaMA",
          "published_at": "2026-06-13T09:30:00Z",
          "date_confidence": "high",
          "engagement": { "score": 128, "comments": 34 },
          "relevance_hint": 0.91,
          "why_relevant": "Directly discusses mobile AI workflows",
          "snippet": "Voice notes and app actions are the sticky workflows."
        }
      ],
      "rerank_score": 0.88,
      "final_score": 84,
      "explanation": "A concrete thread about on-device mobile assistants replacing small daily workflows.",
      "cluster_id": "cluster-on-device",
      "metadata": {}
    }
  ],
  "items_by_source": {
    "reddit": []
  },
  "errors_by_source": {},
  "warnings": []
}
```

- [ ] **Step 2: Write the failing normalizer test**

Create `tests/radar/normalizer.test.js`:

```js
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeLast30DaysReport } from '../../scripts/radar/normalizer.js'

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/fixtures/last30days-mobile-ai.json'), 'utf8')
)

const topic = {
  slug: 'mobile-ai',
  name: 'Mobile AI',
  category: 'ai',
  minRelevance: 5,
}

describe('normalizeLast30DaysReport', () => {
  it('converts ranked candidates into Radar item inputs', () => {
    const items = normalizeLast30DaysReport({ report: fixture, topic })

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      canonicalUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai',
      source: 'reddit',
      sourceItemId: 'reddit-1',
      url: 'https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai/?utm_source=share#comments',
      title: 'People are replacing simple phone workflows with local AI assistants',
      summary: 'Users describe local assistants handling voice notes and app actions.',
      aiSummary: 'A concrete thread about on-device mobile assistants replacing small daily workflows.',
      author: 'localbuilder',
      score: 128,
      relevance: 8,
      category: 'ai',
      topicSlug: 'mobile-ai',
      clusterId: 'cluster-on-device',
      clusterTitle: 'On-device assistants move from demos to daily workflows',
      publishedAt: '2026-06-13T09:30:00Z',
    })
  })

  it('drops candidates with missing urls', () => {
    const report = {
      ...fixture,
      ranked_candidates: [{ ...fixture.ranked_candidates[0], url: '', source_items: [] }],
    }

    expect(normalizeLast30DaysReport({ report, topic })).toEqual([])
  })
})
```

- [ ] **Step 3: Run the normalizer test to verify it fails**

Run:

```bash
pnpm vitest tests/radar/normalizer.test.js --run
```

Expected: FAIL because `scripts/radar/normalizer.js` does not exist.

- [ ] **Step 4: Add the normalizer implementation**

Create `scripts/radar/normalizer.js`:

```js
import { canonicalizeUrl } from './url.js'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function scoreToRelevance(candidate, topic) {
  const finalScore = Number(candidate.final_score || 0)
  const rerankScore = Number(candidate.rerank_score || 0)
  const localRelevance = Number(candidate.local_relevance || 0)

  const derived = Math.round(
    Math.max(
      finalScore / 10,
      rerankScore * 10,
      localRelevance * 10,
      topic.minRelevance || 1
    )
  )

  return clamp(derived, 1, 10)
}

function getPrimarySourceItem(candidate) {
  if (!Array.isArray(candidate.source_items) || candidate.source_items.length === 0) return undefined
  return candidate.source_items.find(item => item.source === candidate.source) || candidate.source_items[0]
}

function getClusterTitle(report, clusterId) {
  if (!clusterId || !Array.isArray(report.clusters)) return undefined
  return report.clusters.find(cluster => cluster.cluster_id === clusterId)?.title
}

export function normalizeLast30DaysReport({ report, topic }) {
  if (!report || !Array.isArray(report.ranked_candidates)) return []

  return report.ranked_candidates
    .map(candidate => {
      const primary = getPrimarySourceItem(candidate)
      const url = candidate.url || primary?.url || ''
      const canonicalUrl = canonicalizeUrl(url)
      const title = candidate.title || primary?.title || ''

      if (!canonicalUrl || !title) return undefined

      const engagement = typeof candidate.engagement === 'number'
        ? candidate.engagement
        : Number(primary?.engagement?.score || primary?.engagement?.likes || 0)

      return {
        canonicalUrl,
        source: candidate.source || primary?.source || 'web',
        sourceItemId: candidate.item_id || primary?.item_id,
        url,
        title,
        summary: candidate.snippet || primary?.snippet || primary?.body || '',
        aiSummary: candidate.explanation || primary?.why_relevant || candidate.snippet || '',
        author: primary?.author,
        score: engagement,
        relevance: scoreToRelevance(candidate, topic),
        category: topic.category,
        topicSlug: topic.slug,
        clusterId: candidate.cluster_id,
        clusterTitle: getClusterTitle(report, candidate.cluster_id),
        publishedAt: primary?.published_at,
        raw: {
          candidate,
          rangeFrom: report.range_from,
          rangeTo: report.range_to,
          generatedAt: report.generated_at,
        },
      }
    })
    .filter(Boolean)
}
```

- [ ] **Step 5: Run the normalizer test to verify it passes**

Run:

```bash
pnpm vitest tests/radar/normalizer.test.js --run
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add scripts/radar/normalizer.js tests/fixtures/last30days-mobile-ai.json tests/radar/normalizer.test.js
git commit -m "feat: normalize last30days radar output"
```

## Task 4: Pulse Generator

**Files:**
- Create: `scripts/radar/pulse.js`
- Test: `tests/radar/pulse.test.js`

- [ ] **Step 1: Write the failing pulse test**

Create `tests/radar/pulse.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { generateRadarPulse } from '../../scripts/radar/pulse.js'

describe('generateRadarPulse', () => {
  it('generates a deterministic concise pulse', () => {
    const pulse = generateRadarPulse({
      date: '2026-06-14',
      items: [
        { id: 7, topicSlug: 'mobile-ai', source: 'reddit', title: 'Mobile AI assistants are moving on-device', relevance: 9, score: 200 },
        { id: 8, topicSlug: 'coding-agents', source: 'github', title: 'Coding agents add repository-level planning', relevance: 8, score: 150 },
        { id: 9, topicSlug: 'mobile-ai', source: 'hackernews', title: 'Developers debate phone-native agents', relevance: 7, score: 80 },
      ],
    })

    expect(pulse).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar found 3 high-signal items across mobile-ai and coding-agents. Top themes: Mobile AI assistants are moving on-device; Coding agents add repository-level planning; Developers debate phone-native agents.',
      topItemIds: [7, 8, 9],
    })
  })

  it('handles empty item sets', () => {
    expect(generateRadarPulse({ date: '2026-06-14', items: [] })).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar did not find enough high-signal items for this run.',
      topItemIds: [],
    })
  })
})
```

- [ ] **Step 2: Run the pulse test to verify it fails**

Run:

```bash
pnpm vitest tests/radar/pulse.test.js --run
```

Expected: FAIL because `scripts/radar/pulse.js` does not exist.

- [ ] **Step 3: Add the pulse implementation**

Create `scripts/radar/pulse.js`:

```js
export function generateRadarPulse({ date, items }) {
  const sorted = [...items].sort((a, b) => {
    const relevanceDiff = Number(b.relevance || 0) - Number(a.relevance || 0)
    if (relevanceDiff !== 0) return relevanceDiff
    return Number(b.score || 0) - Number(a.score || 0)
  })

  const topItems = sorted.slice(0, 5)
  if (topItems.length === 0) {
    return {
      date,
      pulseText: 'Radar did not find enough high-signal items for this run.',
      topItemIds: [],
    }
  }

  const topicSlugs = [...new Set(topItems.map(item => item.topicSlug).filter(Boolean))]
  const topicText = topicSlugs.length === 1
    ? topicSlugs[0]
    : `${topicSlugs.slice(0, -1).join(', ')} and ${topicSlugs.at(-1)}`
  const themes = topItems.slice(0, 3).map(item => item.title).join('; ')

  return {
    date,
    pulseText: `Radar found ${topItems.length} high-signal items across ${topicText}. Top themes: ${themes}.`,
    topItemIds: topItems.map(item => item.id),
  }
}
```

- [ ] **Step 4: Run the pulse test to verify it passes**

Run:

```bash
pnpm vitest tests/radar/pulse.test.js --run
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add scripts/radar/pulse.js tests/radar/pulse.test.js
git commit -m "feat: add radar pulse generator"
```

## Task 5: last30days Adapter

**Files:**
- Create: `scripts/radar/last30days-adapter.js`
- Test: `tests/radar/last30days-adapter.test.js`

- [ ] **Step 1: Write failing adapter tests**

Create `tests/radar/last30days-adapter.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  buildLast30DaysArgs,
  parseLast30DaysJson,
  resolveLast30DaysCli,
  resolvePythonCommand,
} from '../../scripts/radar/last30days-adapter.js'

describe('last30days adapter', () => {
  it('resolves explicit CLI path first', () => {
    expect(resolveLast30DaysCli({ LAST30DAYS_CLI: '/tmp/last30days.py' })).toBe('/tmp/last30days.py')
  })

  it('allows Python command override', () => {
    expect(resolvePythonCommand({ LAST30DAYS_PYTHON: 'python3.13' })).toBe('python3.13')
  })

  it('builds safe args for a quick topic run', () => {
    const args = buildLast30DaysArgs({
      topic: {
        query: 'mobile AI',
        mode: 'quick',
        lookbackDays: 30,
        sourceHints: {
          subreddits: ['LocalLLaMA', 'ArtificialInteligence'],
          githubRepos: [],
          xHandles: [],
          tiktokHashtags: ['mobileai'],
          instagramCreators: [],
        },
      },
      saveDir: '.data/radar/raw',
    })

    expect(args).toEqual([
      'mobile AI',
      '--emit=json',
      '--days',
      '30',
      '--quick',
      '--save-dir',
      '.data/radar/raw',
      '--subreddits',
      'LocalLLaMA,ArtificialInteligence',
      '--tiktok-hashtags',
      'mobileai',
    ])
  })

  it('parses valid JSON and rejects invalid JSON', () => {
    expect(parseLast30DaysJson('{"topic":"mobile AI"}')).toEqual({ topic: 'mobile AI' })
    expect(() => parseLast30DaysJson('not json')).toThrow('last30days emitted invalid JSON')
  })
})
```

- [ ] **Step 2: Run adapter tests to verify they fail**

Run:

```bash
pnpm vitest tests/radar/last30days-adapter.test.js --run
```

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Add the adapter implementation**

Create `scripts/radar/last30days-adapter.js`:

```js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const DEFAULT_LOCAL_CLI = '/Users/aaronguo/.agents/skills/last30days/scripts/last30days.py'

export function resolveLast30DaysCli(env = process.env) {
  return env.LAST30DAYS_CLI || DEFAULT_LOCAL_CLI
}

export function resolvePythonCommand(env = process.env) {
  return env.LAST30DAYS_PYTHON || 'python3.12'
}

export function buildLast30DaysArgs({ topic, saveDir }) {
  const args = [
    topic.query,
    '--emit=json',
    '--days',
    String(topic.lookbackDays),
    topic.mode === 'deep' ? '--deep' : '--quick',
  ]

  if (saveDir) {
    args.push('--save-dir', saveDir)
  }

  const hints = topic.sourceHints || {}
  if (hints.subreddits?.length) {
    args.push('--subreddits', hints.subreddits.join(','))
  }
  if (hints.githubRepos?.length) {
    args.push('--github-repo', hints.githubRepos.join(','))
  }
  if (hints.xHandles?.length) {
    const [primary, ...related] = hints.xHandles
    args.push('--x-handle', primary)
    if (related.length) args.push('--x-related', related.join(','))
  }
  if (hints.tiktokHashtags?.length) {
    args.push('--tiktok-hashtags', hints.tiktokHashtags.join(','))
  }
  if (hints.instagramCreators?.length) {
    args.push('--ig-creators', hints.instagramCreators.join(','))
  }

  return args
}

export function parseLast30DaysJson(stdout) {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    throw new Error(`last30days emitted invalid JSON: ${error.message}`)
  }
}

export async function runLast30Days({ topic, saveDir = '.data/radar/raw', timeoutMs = 300000, env = process.env }) {
  const cliPath = resolveLast30DaysCli(env)
  const pythonCommand = resolvePythonCommand(env)
  const args = buildLast30DaysArgs({ topic, saveDir })
  const { stdout, stderr } = await execFileAsync(pythonCommand, [cliPath, ...args], {
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024 * 20,
    env,
  })

  return {
    report: parseLast30DaysJson(stdout),
    stderr,
    command: [pythonCommand, cliPath, ...args],
  }
}
```

- [ ] **Step 4: Run adapter tests to verify they pass**

Run:

```bash
pnpm vitest tests/radar/last30days-adapter.test.js --run
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add scripts/radar/last30days-adapter.js tests/radar/last30days-adapter.test.js
git commit -m "feat: add last30days adapter"
```

## Task 6: Turso Schema and Repository

**Files:**
- Create: `scripts/radar/schema.sql`
- Create: `scripts/radar/repository.js`
- Test: `tests/radar/repository.test.js`

- [ ] **Step 1: Add the schema file**

Create `scripts/radar/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS radar_topics (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL,
  cadence TEXT NOT NULL,
  mode TEXT NOT NULL,
  lookback_days INTEGER NOT NULL,
  visibility TEXT NOT NULL,
  min_relevance INTEGER NOT NULL,
  source_hints_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS radar_runs (
  id INTEGER PRIMARY KEY,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT NOT NULL,
  cadence TEXT,
  mode TEXT,
  topic_slug TEXT,
  lookback_days INTEGER,
  raw_archive_path TEXT,
  warning_json TEXT,
  source_error_json TEXT,
  items_seen INTEGER DEFAULT 0,
  items_written INTEGER DEFAULT 0,
  error_message TEXT,
  FOREIGN KEY (topic_slug) REFERENCES radar_topics(slug)
);

CREATE TABLE IF NOT EXISTS radar_items (
  id INTEGER PRIMARY KEY,
  canonical_url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  source_item_id TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  author TEXT,
  published_at TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS radar_item_topics (
  item_id INTEGER NOT NULL,
  topic_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  score REAL DEFAULT 0,
  relevance INTEGER DEFAULT 1,
  cluster_id TEXT,
  cluster_title TEXT,
  first_seen_at TEXT DEFAULT (datetime('now')),
  last_seen_at TEXT DEFAULT (datetime('now')),
  sighting_count INTEGER DEFAULT 1,
  latest_run_id INTEGER,
  PRIMARY KEY (item_id, topic_slug),
  FOREIGN KEY (item_id) REFERENCES radar_items(id),
  FOREIGN KEY (topic_slug) REFERENCES radar_topics(slug),
  FOREIGN KEY (latest_run_id) REFERENCES radar_runs(id)
);

CREATE TABLE IF NOT EXISTS radar_daily_pulses (
  date TEXT PRIMARY KEY,
  pulse_text TEXT NOT NULL,
  top_item_ids TEXT NOT NULL,
  generated_at TEXT DEFAULT (datetime('now')),
  run_id INTEGER,
  FOREIGN KEY (run_id) REFERENCES radar_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_radar_item_topics_topic_relevance
  ON radar_item_topics(topic_slug, relevance DESC, score DESC);

CREATE INDEX IF NOT EXISTS idx_radar_items_source
  ON radar_items(source);

CREATE INDEX IF NOT EXISTS idx_radar_runs_status
  ON radar_runs(status, started_at);
```

- [ ] **Step 2: Write failing repository tests**

Create `tests/radar/repository.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  buildTopicRow,
  createRadarRun,
  upsertRadarItems,
} from '../../scripts/radar/repository.js'

function createFakeClient() {
  const calls = []
  return {
    calls,
    async execute(input) {
      calls.push(input)
      const sql = typeof input === 'string' ? input : input.sql
      if (sql.includes('INSERT INTO radar_runs')) return { lastInsertRowid: 42, rows: [] }
      if (sql.includes('SELECT id FROM radar_items')) return { rows: [{ id: 7 }] }
      return { rows: [] }
    },
  }
}

describe('radar repository', () => {
  it('builds topic rows with serialized source hints', () => {
    const row = buildTopicRow({
      slug: 'mobile-ai',
      name: 'Mobile AI',
      query: 'mobile AI',
      category: 'ai',
      cadence: 'daily',
      mode: 'quick',
      lookbackDays: 30,
      visibility: 'public',
      minRelevance: 5,
      sourceHints: { subreddits: ['LocalLLaMA'] },
    })

    expect(row).toEqual([
      'mobile-ai',
      'Mobile AI',
      'mobile AI',
      'ai',
      'daily',
      'quick',
      30,
      'public',
      5,
      '{"subreddits":["LocalLLaMA"]}',
    ])
  })

  it('creates a run and returns its id', async () => {
    const client = createFakeClient()
    await expect(createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })).resolves.toBe(42)
    expect(client.calls[0].sql).toContain('INSERT INTO radar_runs')
  })

  it('upserts items and topic membership', async () => {
    const client = createFakeClient()
    const ids = await upsertRadarItems(client, {
      runId: 42,
      items: [{
        canonicalUrl: 'https://example.com/a',
        source: 'reddit',
        sourceItemId: 'reddit-1',
        url: 'https://example.com/a?utm_source=x',
        title: 'A',
        summary: 'Summary',
        aiSummary: 'AI summary',
        author: 'author',
        score: 100,
        relevance: 8,
        category: 'ai',
        topicSlug: 'mobile-ai',
        clusterId: 'c1',
        clusterTitle: 'Cluster',
        publishedAt: '2026-06-14T00:00:00Z',
        raw: { ok: true },
      }],
    })

    expect(ids).toEqual([7])
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_items'))).toBe(true)
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_item_topics'))).toBe(true)
  })
})
```

- [ ] **Step 3: Run repository tests to verify they fail**

Run:

```bash
pnpm vitest tests/radar/repository.test.js --run
```

Expected: FAIL because `scripts/radar/repository.js` does not exist.

- [ ] **Step 4: Add repository implementation**

Create `scripts/radar/repository.js`:

```js
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@libsql/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function createRadarClient(env = process.env) {
  if (!env.TURSO_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required for Radar storage')
  }

  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}

export function getRadarSchemaSql() {
  return readFileSync(join(__dirname, 'schema.sql'), 'utf8')
}

export async function discoverSchema(client) {
  const tables = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)

  const result = []
  for (const row of tables.rows) {
    const columns = await client.execute(`PRAGMA table_info(${row.name})`)
    result.push({
      table: row.name,
      columns: columns.rows.map(column => column.name),
    })
  }

  return result
}

export async function migrateRadarSchema(client) {
  const statements = getRadarSchemaSql()
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await client.execute(`${statement};`)
  }
}

export function buildTopicRow(topic) {
  return [
    topic.slug,
    topic.name,
    topic.query,
    topic.category,
    topic.cadence,
    topic.mode,
    topic.lookbackDays,
    topic.visibility,
    topic.minRelevance,
    JSON.stringify(topic.sourceHints || {}),
  ]
}

export async function upsertRadarTopic(client, topic) {
  await client.execute({
    sql: `INSERT INTO radar_topics
      (slug, name, query, category, cadence, mode, lookback_days, visibility, min_relevance, source_hints_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        query = excluded.query,
        category = excluded.category,
        cadence = excluded.cadence,
        mode = excluded.mode,
        lookback_days = excluded.lookback_days,
        visibility = excluded.visibility,
        min_relevance = excluded.min_relevance,
        source_hints_json = excluded.source_hints_json,
        updated_at = datetime('now')`,
    args: buildTopicRow(topic),
  })
}

export async function createRadarRun(client, { topicSlug, mode, lookbackDays, cadence = null }) {
  const result = await client.execute({
    sql: `INSERT INTO radar_runs (status, topic_slug, mode, lookback_days, cadence)
          VALUES ('running', ?, ?, ?, ?)`,
    args: [topicSlug, mode, lookbackDays, cadence],
  })

  return Number(result.lastInsertRowid)
}

export async function finishRadarRun(client, { runId, status, itemsSeen, itemsWritten, warnings = {}, sourceErrors = {}, errorMessage = null }) {
  await client.execute({
    sql: `UPDATE radar_runs SET
            completed_at = datetime('now'),
            status = ?,
            items_seen = ?,
            items_written = ?,
            warning_json = ?,
            source_error_json = ?,
            error_message = ?
          WHERE id = ?`,
    args: [
      status,
      itemsSeen,
      itemsWritten,
      JSON.stringify(warnings),
      JSON.stringify(sourceErrors),
      errorMessage,
      runId,
    ],
  })
}

export async function upsertRadarItems(client, { runId, items }) {
  const ids = []

  for (const item of items) {
    await client.execute({
      sql: `INSERT INTO radar_items
        (canonical_url, source, source_item_id, url, title, summary, ai_summary, author, published_at, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(canonical_url) DO UPDATE SET
          source = excluded.source,
          source_item_id = excluded.source_item_id,
          url = excluded.url,
          title = excluded.title,
          summary = excluded.summary,
          ai_summary = excluded.ai_summary,
          author = excluded.author,
          published_at = excluded.published_at,
          raw_json = excluded.raw_json,
          updated_at = datetime('now')`,
      args: [
        item.canonicalUrl,
        item.source,
        item.sourceItemId || null,
        item.url,
        item.title,
        item.summary || '',
        item.aiSummary || '',
        item.author || null,
        item.publishedAt || null,
        JSON.stringify(item.raw || {}),
      ],
    })

    const selected = await client.execute({
      sql: 'SELECT id FROM radar_items WHERE canonical_url = ?',
      args: [item.canonicalUrl],
    })
    const itemId = Number(selected.rows[0].id)
    ids.push(itemId)

    await client.execute({
      sql: `INSERT INTO radar_item_topics
        (item_id, topic_slug, category, score, relevance, cluster_id, cluster_title, latest_run_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_id, topic_slug) DO UPDATE SET
          category = excluded.category,
          score = MAX(radar_item_topics.score, excluded.score),
          relevance = MAX(radar_item_topics.relevance, excluded.relevance),
          cluster_id = excluded.cluster_id,
          cluster_title = excluded.cluster_title,
          last_seen_at = datetime('now'),
          sighting_count = radar_item_topics.sighting_count + 1,
          latest_run_id = excluded.latest_run_id`,
      args: [
        itemId,
        item.topicSlug,
        item.category,
        item.score,
        item.relevance,
        item.clusterId || null,
        item.clusterTitle || null,
        runId,
      ],
    })
  }

  return ids
}

export async function upsertRadarPulse(client, { runId, pulse }) {
  await client.execute({
    sql: `INSERT INTO radar_daily_pulses (date, pulse_text, top_item_ids, run_id)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(date) DO UPDATE SET
            pulse_text = excluded.pulse_text,
            top_item_ids = excluded.top_item_ids,
            generated_at = datetime('now'),
            run_id = excluded.run_id`,
    args: [pulse.date, pulse.pulseText, JSON.stringify(pulse.topItemIds), runId],
  })
}
```

- [ ] **Step 5: Run repository tests to verify they pass**

Run:

```bash
pnpm vitest tests/radar/repository.test.js --run
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

Run:

```bash
git add scripts/radar/schema.sql scripts/radar/repository.js tests/radar/repository.test.js
git commit -m "feat: add radar turso repository"
```

## Task 7: Runner and CLI

**Files:**
- Create: `scripts/radar/runner.js`
- Create: `scripts/radar/cli.js`
- Test: `tests/radar/runner.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write failing runner tests**

Create `tests/radar/runner.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { runRadarTopic } from '../../scripts/radar/runner.js'

const topic = {
  slug: 'mobile-ai',
  name: 'Mobile AI',
  query: 'mobile AI',
  category: 'ai',
  cadence: 'daily',
  mode: 'quick',
  lookbackDays: 30,
  visibility: 'public',
  minRelevance: 5,
  sourceHints: {},
}

const report = {
  topic: 'mobile AI',
  range_from: '2026-05-15',
  range_to: '2026-06-14',
  generated_at: '2026-06-14T14:00:00Z',
  clusters: [],
  ranked_candidates: [],
  items_by_source: {},
  errors_by_source: {},
  warnings: [],
}

describe('runRadarTopic', () => {
  it('supports dry-run without repository writes', async () => {
    const result = await runRadarTopic({
      topic,
      dryRun: true,
      adapter: async () => ({ report, stderr: '', command: ['python3.12', 'last30days.py'] }),
      repository: undefined,
      today: '2026-06-14',
    })

    expect(result).toMatchObject({
      topicSlug: 'mobile-ai',
      status: 'dry_run',
      itemsSeen: 0,
      itemsWritten: 0,
    })
  })

  it('writes normalized items and pulse through the repository', async () => {
    const calls = []
    const repository = {
      upsertRadarTopic: async () => calls.push('topic'),
      createRadarRun: async () => 42,
      upsertRadarItems: async () => {
        calls.push('items')
        return [7]
      },
      upsertRadarPulse: async () => calls.push('pulse'),
      finishRadarRun: async () => calls.push('finish'),
    }

    const fullReport = {
      ...report,
      clusters: [{ cluster_id: 'c1', title: 'Cluster', candidate_ids: ['c1'], representative_ids: ['c1'], sources: ['reddit'], score: 10 }],
      ranked_candidates: [{
        candidate_id: 'c1',
        item_id: 'item-1',
        source: 'reddit',
        title: 'Mobile AI moves on-device',
        url: 'https://example.com/mobile-ai',
        snippet: 'Snippet',
        local_relevance: 0.9,
        freshness: 9,
        engagement: 100,
        source_quality: 1,
        rrf_score: 0.1,
        final_score: 90,
        explanation: 'Explanation',
        cluster_id: 'c1',
        source_items: [],
      }],
    }

    const result = await runRadarTopic({
      topic,
      dryRun: false,
      client: {},
      adapter: async () => ({ report: fullReport, stderr: '', command: [] }),
      repository,
      today: '2026-06-14',
    })

    expect(result.status).toBe('completed')
    expect(result.itemsSeen).toBe(1)
    expect(result.itemsWritten).toBe(1)
    expect(calls).toEqual(['topic', 'items', 'pulse', 'finish'])
  })
})
```

- [ ] **Step 2: Run runner tests to verify they fail**

Run:

```bash
pnpm vitest tests/radar/runner.test.js --run
```

Expected: FAIL because `scripts/radar/runner.js` does not exist.

- [ ] **Step 3: Add runner implementation**

Create `scripts/radar/runner.js`:

```js
import { getRadarTopics, getRadarTopicBySlug } from './config.js'
import { runLast30Days } from './last30days-adapter.js'
import { normalizeLast30DaysReport } from './normalizer.js'
import { generateRadarPulse } from './pulse.js'
import * as defaultRepository from './repository.js'

export async function runRadarTopic({
  topic,
  dryRun = false,
  client,
  adapter = runLast30Days,
  repository = defaultRepository,
  today = new Date().toISOString().slice(0, 10),
}) {
  const adapterResult = await adapter({ topic })
  const items = normalizeLast30DaysReport({ report: adapterResult.report, topic })

  if (dryRun) {
    return {
      topicSlug: topic.slug,
      status: 'dry_run',
      command: adapterResult.command,
      itemsSeen: items.length,
      itemsWritten: 0,
      warnings: adapterResult.report.warnings || [],
      sourceErrors: adapterResult.report.errors_by_source || {},
    }
  }

  await repository.upsertRadarTopic(client, topic)
  const runId = await repository.createRadarRun(client, {
    topicSlug: topic.slug,
    mode: topic.mode,
    lookbackDays: topic.lookbackDays,
    cadence: topic.cadence,
  })

  try {
    const itemIds = await repository.upsertRadarItems(client, { runId, items })
    const pulseItems = items.map((item, index) => ({ ...item, id: itemIds[index] })).filter(item => item.id)
    const pulse = generateRadarPulse({ date: today, items: pulseItems })
    await repository.upsertRadarPulse(client, { runId, pulse })
    await repository.finishRadarRun(client, {
      runId,
      status: adapterResult.report.warnings?.length ? 'completed_with_warnings' : 'completed',
      itemsSeen: items.length,
      itemsWritten: itemIds.length,
      warnings: adapterResult.report.warnings || [],
      sourceErrors: adapterResult.report.errors_by_source || {},
    })

    return {
      topicSlug: topic.slug,
      status: adapterResult.report.warnings?.length ? 'completed_with_warnings' : 'completed',
      runId,
      itemsSeen: items.length,
      itemsWritten: itemIds.length,
    }
  } catch (error) {
    await repository.finishRadarRun(client, {
      runId,
      status: 'failed',
      itemsSeen: items.length,
      itemsWritten: 0,
      errorMessage: error.message,
    })
    throw error
  }
}

export async function runRadar({ topicSlug, dryRun = false, cadence, client }) {
  const topics = topicSlug
    ? [getRadarTopicBySlug(topicSlug)].filter(Boolean)
    : getRadarTopics().filter(topic => topic.visibility === 'public' && topic.cadence !== 'manual' && (!cadence || topic.cadence === cadence))

  if (topicSlug && topics.length === 0) {
    throw new Error(`Unknown Radar topic: ${topicSlug}`)
  }

  const results = []
  for (const topic of topics) {
    results.push(await runRadarTopic({ topic, dryRun, client }))
  }

  return results
}
```

- [ ] **Step 4: Add CLI implementation**

Create `scripts/radar/cli.js`:

```js
#!/usr/bin/env node
import { getRadarTopics } from './config.js'
import { runRadar } from './runner.js'
import {
  createRadarClient,
  discoverSchema,
  migrateRadarSchema,
} from './repository.js'

function parseArgs(argv) {
  const args = { command: argv[2], dryRun: false, topicSlug: undefined, cadence: undefined }
  for (let index = 3; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--dry-run') args.dryRun = true
    if (value === '--topic') {
      args.topicSlug = argv[index + 1]
      index += 1
    }
    if (value === '--cadence') {
      args.cadence = argv[index + 1]
      index += 1
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)

  if (args.command === 'topics') {
    console.log(JSON.stringify(getRadarTopics(), null, 2))
    return
  }

  if (args.command === 'diagnose') {
    const client = createRadarClient()
    const schema = await discoverSchema(client)
    console.log(JSON.stringify({ ok: true, schema }, null, 2))
    return
  }

  if (args.command === 'migrate') {
    const client = createRadarClient()
    await migrateRadarSchema(client)
    console.log(JSON.stringify({ ok: true, action: 'migrated' }, null, 2))
    return
  }

  if (args.command === 'run') {
    const client = args.dryRun ? undefined : createRadarClient()
    const results = await runRadar({
      topicSlug: args.topicSlug,
      dryRun: args.dryRun,
      cadence: args.cadence,
      client,
    })
    console.log(JSON.stringify({ ok: true, results }, null, 2))
    return
  }

  throw new Error('Usage: node scripts/radar/cli.js <topics|diagnose|migrate|run> [--topic slug] [--dry-run] [--cadence daily]')
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
```

- [ ] **Step 5: Add package scripts**

Modify `package.json` scripts by adding:

```json
"radar:topics": "node scripts/radar/cli.js topics",
"radar:run": "node scripts/radar/cli.js run",
"radar:diagnose": "node scripts/radar/cli.js diagnose",
"radar:migrate": "node scripts/radar/cli.js migrate"
```

Keep the existing scripts unchanged.

- [ ] **Step 6: Run runner tests and topic command**

Run:

```bash
pnpm vitest tests/radar/runner.test.js --run
pnpm radar:topics
```

Expected: tests PASS and `pnpm radar:topics` prints the configured topic JSON.

- [ ] **Step 7: Commit Task 7**

Run:

```bash
git add scripts/radar/runner.js scripts/radar/cli.js tests/radar/runner.test.js package.json
git commit -m "feat: add radar runner cli"
```

## Task 8: Radar-Backed Signal API

**Files:**
- Create: `server/utils/signal-radar.ts`
- Test: `tests/signal-radar.test.ts`
- Modify: `server/api/signal.get.ts`
- Modify: `server/api/signal-pulse.get.ts`

- [ ] **Step 1: Write failing query utility tests**

Create `tests/signal-radar.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildSignalRadarWhere, mapRadarItemRow } from '../server/utils/signal-radar'

describe('buildSignalRadarWhere', () => {
  it('builds args for filters', () => {
    expect(buildSignalRadarWhere({
      source: 'reddit',
      category: 'ai',
      topic: 'mobile-ai',
      minRelevance: 6,
      search: 'assistant',
    })).toEqual({
      sql: [
        'rit.relevance >= ?',
        'ri.source = ?',
        'rit.category = ?',
        'rit.topic_slug = ?',
        'ri.title LIKE ?',
      ],
      args: [6, 'reddit', 'ai', 'mobile-ai', '%assistant%'],
    })
  })
})

describe('mapRadarItemRow', () => {
  it('maps radar rows to the existing Signal item shape', () => {
    expect(mapRadarItemRow({
      id: 7,
      source: 'reddit',
      url: 'https://example.com',
      title: 'Title',
      summary: 'Summary',
      ai_summary: 'AI',
      author: 'Author',
      score: 12,
      relevance: 8,
      category: 'ai',
      topic_slug: 'mobile-ai',
      created_at: '2026-06-14 12:00:00',
      last_seen_at: '2026-06-14 13:00:00',
    })).toEqual({
      id: 7,
      source: 'reddit',
      url: 'https://example.com',
      title: 'Title',
      summary: 'Summary',
      ai_summary: 'AI',
      author: 'Author',
      score: 12,
      relevance: 8,
      category: 'ai',
      topic_slug: 'mobile-ai',
      created_at: '2026-06-14 13:00:00',
    })
  })
})
```

- [ ] **Step 2: Run API utility tests to verify they fail**

Run:

```bash
pnpm vitest tests/signal-radar.test.ts --run
```

Expected: FAIL because `server/utils/signal-radar.ts` does not exist.

- [ ] **Step 3: Add API utility implementation**

Create `server/utils/signal-radar.ts`:

```ts
type FilterInput = {
  source?: string
  category?: string
  topic?: string
  minRelevance: number
  search?: string
}

type RadarRow = Record<string, unknown>

export function buildSignalRadarWhere(input: FilterInput) {
  const sql: string[] = ['rit.relevance >= ?']
  const args: (string | number)[] = [input.minRelevance]

  if (input.source) {
    sql.push('ri.source = ?')
    args.push(input.source)
  }
  if (input.category) {
    sql.push('rit.category = ?')
    args.push(input.category)
  }
  if (input.topic) {
    sql.push('rit.topic_slug = ?')
    args.push(input.topic)
  }
  if (input.search) {
    sql.push('ri.title LIKE ?')
    args.push(`%${input.search}%`)
  }

  return { sql, args }
}

export function mapRadarItemRow(row: RadarRow) {
  return {
    id: row.id,
    source: row.source,
    url: row.url,
    title: row.title,
    summary: row.summary,
    ai_summary: row.ai_summary,
    author: row.author,
    score: row.score,
    relevance: row.relevance,
    category: row.category,
    topic_slug: row.topic_slug,
    created_at: row.last_seen_at || row.created_at,
  }
}

export function isMissingRadarTableError(error: unknown) {
  return error instanceof Error && /no such table: radar_/i.test(error.message)
}
```

- [ ] **Step 4: Run API utility tests to verify they pass**

Run:

```bash
pnpm vitest tests/signal-radar.test.ts --run
```

Expected: PASS.

- [ ] **Step 5: Replace `/api/signal` query logic**

Modify `server/api/signal.get.ts` so the handler first queries Radar tables. Use this SQL shape inside the existing cached handler:

```ts
import { useTurso } from '../utils/turso'
import { buildSignalRadarWhere, isMissingRadarTableError, mapRadarItemRow } from '../utils/signal-radar'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const source = (query.source as string) || ''
  const category = (query.category as string) || ''
  const topic = (query.topic as string) || ''
  const minRelevance = parseInt((query.minRelevance as string) || '5')
  const limit = Math.min(parseInt((query.limit as string) || '50'), 100)
  const offset = parseInt((query.offset as string) || '0')
  const search = (query.q as string) || ''

  const db = useTurso()
  const where = buildSignalRadarWhere({ source, category, topic, minRelevance, search })

  try {
    const result = await db.execute({
      sql: `SELECT
              ri.id, ri.source, ri.url, ri.title, ri.summary, ri.ai_summary, ri.author,
              rit.score, rit.relevance, rit.category, rit.topic_slug, ri.created_at, rit.last_seen_at
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${where.sql.join(' AND ')}
            ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC
            LIMIT ? OFFSET ?`,
      args: [...where.args, limit, offset],
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total
            FROM radar_items ri
            JOIN radar_item_topics rit ON rit.item_id = ri.id
            WHERE ${where.sql.join(' AND ')}`,
      args: where.args,
    })

    const stats = await db.execute(
      `SELECT ri.source, COUNT(*) as count
       FROM radar_items ri
       JOIN radar_item_topics rit ON rit.item_id = ri.id
       WHERE rit.relevance >= 5
       GROUP BY ri.source
       ORDER BY count DESC`
    )

    const topics = await db.execute(
      `SELECT slug, name, category
       FROM radar_topics
       WHERE visibility = 'public'
       ORDER BY name`
    )

    const latestRun = await db.execute(
      `SELECT id, status, started_at, completed_at
       FROM radar_runs
       ORDER BY started_at DESC
       LIMIT 1`
    )

    return {
      items: result.rows.map(mapRadarItemRow),
      total: countResult.rows[0]?.total || 0,
      stats: stats.rows,
      topics: topics.rows,
      latestRun: latestRun.rows[0] || null,
      limit,
      offset,
    }
  } catch (error) {
    if (!isMissingRadarTableError(error)) throw error

    const where: string[] = ['relevance >= ?']
    const args: (string | number)[] = [minRelevance]

    if (source) { where.push('source = ?'); args.push(source) }
    if (category) { where.push('category = ?'); args.push(category) }
    if (search) { where.push('title LIKE ?'); args.push(`%${search}%`) }

    const result = await db.execute({
      sql: `SELECT id, source, url, title, summary, ai_summary, author, score, relevance, tags, category, created_at
            FROM items WHERE ${where.join(' AND ')}
            ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    })

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM items WHERE ${where.join(' AND ')}`,
      args,
    })

    const stats = await db.execute(
      `SELECT source, COUNT(*) as count FROM items WHERE relevance >= 5 GROUP BY source ORDER BY count DESC`
    )

    return {
      items: result.rows,
      total: countResult.rows[0]?.total || 0,
      stats: stats.rows,
      topics: [],
      latestRun: null,
      limit,
      offset,
    }
  }
}, {
  maxAge: 300,
  name: 'signal',
  getKey: (event) => {
    const q = getQuery(event)
    return `signal:${q.source || ''}:${q.category || ''}:${q.topic || ''}:${q.minRelevance || '5'}:${q.offset || '0'}:${q.q || ''}`
  },
})
```

- [ ] **Step 6: Replace `/api/signal-pulse` query logic**

Modify `server/api/signal-pulse.get.ts` so Radar is the primary path and legacy `daily_pulse` is fallback:

```ts
import { useTurso } from '../utils/turso'
import { isMissingRadarTableError } from '../utils/signal-radar'

export default defineCachedEventHandler(async () => {
  const db = useTurso()

  try {
    const pulseResult = await db.execute(
      `SELECT date, pulse_text, top_item_ids, generated_at
       FROM radar_daily_pulses
       ORDER BY date DESC LIMIT 1`
    )

    const pulse = pulseResult.rows[0]
    if (!pulse) {
      return { pulse: null, items: [], date: null }
    }

    const topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
    let items: any[] = []

    if (topIds.length > 0) {
      const placeholders = topIds.map(() => '?').join(',')
      const itemsResult = await db.execute({
        sql: `SELECT
                ri.id, ri.source, ri.url, ri.title, ri.ai_summary,
                rit.relevance, rit.category, rit.score, rit.last_seen_at as created_at
              FROM radar_items ri
              JOIN radar_item_topics rit ON rit.item_id = ri.id
              WHERE ri.id IN (${placeholders})
              ORDER BY rit.relevance DESC, rit.score DESC`,
        args: topIds,
      })
      items = itemsResult.rows
    }

    return {
      pulse: pulse.pulse_text,
      date: pulse.date,
      generatedAt: pulse.generated_at,
      items,
    }
  } catch (error) {
    if (!isMissingRadarTableError(error)) throw error

    const pulseResult = await db.execute(
      `SELECT date, pulse_text, top_item_ids, generated_at
       FROM daily_pulse
       ORDER BY date DESC LIMIT 1`
    )

    const pulse = pulseResult.rows[0]
    if (!pulse) {
      return { pulse: null, items: [], date: null }
    }

    const topIds: number[] = pulse.top_item_ids ? JSON.parse(pulse.top_item_ids as string) : []
    let items: any[] = []
    if (topIds.length > 0) {
      const placeholders = topIds.map(() => '?').join(',')
      const itemsResult = await db.execute({
        sql: `SELECT id, source, url, title, ai_summary, relevance, category, score, created_at
              FROM items WHERE id IN (${placeholders})
              ORDER BY relevance DESC, score DESC`,
        args: topIds,
      })
      items = itemsResult.rows
    }

    return {
      pulse: pulse.pulse_text,
      date: pulse.date,
      generatedAt: pulse.generated_at,
      items,
    }
  }
}, {
  maxAge: 600,
  name: 'signal-pulse',
})
```

- [ ] **Step 7: Run API utility tests and lint**

Run:

```bash
pnpm vitest tests/signal-radar.test.ts --run
pnpm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit Task 8**

Run:

```bash
git add server/utils/signal-radar.ts tests/signal-radar.test.ts server/api/signal.get.ts server/api/signal-pulse.get.ts
git commit -m "feat: read signal from radar tables"
```

## Task 9: Signal UI and i18n

**Files:**
- Modify: `pages/signal.vue`
- Modify: `components/main/signal.vue`
- Modify: `i18n/locales/en-US.json`
- Modify: `i18n/locales/zh-CN.json`

- [ ] **Step 1: Add topic state and query param to `pages/signal.vue`**

In `pages/signal.vue`, add:

```ts
const activeTopic = ref('')
```

Update the `/api/signal` query object:

```ts
query: computed(() => ({
  source: activeSource.value,
  category: activeCategory.value,
  topic: activeTopic.value,
  minRelevance: 5,
  offset: offset.value,
  q: searchQuery.value,
  limit: 50,
})),
```

Add the setter:

```ts
function setTopic(topic: string) {
  activeTopic.value = topic
  offset.value = 0
  refresh()
}
```

Add computed API topics:

```ts
const topics = computed(() => {
  const apiTopics = (data.value?.topics as Record<string, string>[] | undefined) || []
  return apiTopics.map(topic => ({
    slug: topic.slug,
    name: topic.name,
  }))
})
```

- [ ] **Step 2: Replace hardcoded source maps in `pages/signal.vue`**

Extend the existing source helper maps to include Radar sources:

```ts
const sources = ['hackernews', 'x-twitter', 'reddit', 'producthunt', 'github', 'lobsters', 'arxiv', 'youtube', 'tiktok', 'instagram', 'polymarket', 'web']
```

Add these entries to `sourceColor`, `sourceBg`, and `sourceLabel`:

```ts
youtube: 'border-l-red-500',
tiktok: 'border-l-sky-500',
instagram: 'border-l-fuchsia-500',
polymarket: 'border-l-blue-500',
web: 'border-l-emerald-500',
```

```ts
youtube: 'bg-red-500',
tiktok: 'bg-sky-500',
instagram: 'bg-fuchsia-500',
polymarket: 'bg-blue-500',
web: 'bg-emerald-500',
```

```ts
youtube: 'YouTube',
tiktok: 'TikTok',
instagram: 'Instagram',
polymarket: 'Polymarket',
web: 'Web',
```

- [ ] **Step 3: Add topic filter row to `pages/signal.vue`**

Insert this row below the category row:

```vue
<div v-if="topics.length > 0" class="flex items-center gap-1.5 flex-wrap">
  <button
    class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
    :class="
      activeTopic === ''
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    "
    @click="setTopic('')"
  >
    {{ t('signal.allRadarTopics') }}
  </button>
  <button
    v-for="topic in topics"
    :key="topic.slug"
    class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
    :class="
      activeTopic === topic.slug
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    "
    @click="setTopic(topic.slug)"
  >
    {{ topic.name }}
  </button>
</div>
```

- [ ] **Step 4: Add freshness display to `pages/signal.vue`**

Add computed latest run:

```ts
const latestRun = computed(() => data.value?.latestRun as Record<string, string> | null)
```

Add this line near the count display:

```vue
<span v-if="latestRun" class="text-xs text-muted-foreground/40 font-mono">
  {{ t('signal.updated') }} {{ timeAgo(latestRun.completed_at || latestRun.started_at) }}
</span>
```

- [ ] **Step 5: Update `components/main/signal.vue` source labels**

Extend the `sourceColor` map in `components/main/signal.vue`:

```ts
const map: Record<string, string> = {
  hackernews: 'bg-orange-400',
  'x-twitter': 'bg-foreground',
  reddit: 'bg-purple-500',
  producthunt: 'bg-amber-500',
  github: 'bg-pink-500',
  lobsters: 'bg-red-400',
  arxiv: 'bg-cyan-400',
  youtube: 'bg-red-500',
  tiktok: 'bg-sky-500',
  instagram: 'bg-fuchsia-500',
  polymarket: 'bg-blue-500',
  web: 'bg-emerald-500',
}
```

- [ ] **Step 6: Update English i18n**

In `i18n/locales/en-US.json`, update the `signal` object with these keys and values:

```json
"poweredBy": "Radar 2.0 researches the topics I care about with last30days, then normalizes the useful public signals into this feed. No engagement algorithms - just intentional signal.",
"whatIsThisDesc": "Radar 2.0 follows configured topics such as mobile AI, coding agents, consumer AI apps, and personal AI systems. It uses last30days for multi-source research, stores structured links in Signal, and keeps blog posts separate from automated research output.",
"description": "Radar-backed AI and technology signal feed. Structured public links, not automated blog posts.",
"allRadarTopics": "All Radar Topics",
"updated": "Updated"
```

- [ ] **Step 7: Update Chinese i18n**

In `i18n/locales/zh-CN.json`, update the `signal` object with these keys and values:

```json
"poweredBy": "Radar 2.0 用 last30days 研究我关心的话题，再把有价值的公开信号结构化放进这个 feed。没有流量算法，只有有意图的信号。",
"whatIsThisDesc": "Radar 2.0 追踪 mobile AI、coding agents、consumer AI apps、personal AI systems 等配置话题。它用 last30days 做多源研究，把结构化链接存入 Signal，同时保持博客文章和自动研究输出分离。",
"description": "由 Radar 驱动的 AI 与科技信号流。这里是结构化公开链接，不是自动生成的博客文章。",
"allRadarTopics": "全部 Radar 话题",
"updated": "更新于"
```

- [ ] **Step 8: Run lint and generate**

Run:

```bash
pnpm run lint
pnpm run generate
```

Expected: both commands pass. If `generate` fails due missing Turso credentials during prerender, verify `/signal` remains excluded from prerender in `nuxt.config.ts`.

- [ ] **Step 9: Commit Task 9**

Run:

```bash
git add pages/signal.vue components/main/signal.vue i18n/locales/en-US.json i18n/locales/zh-CN.json
git commit -m "feat: update signal for radar topics"
```

## Task 10: Workflow, Environment, and Docs

**Files:**
- Create: `.github/workflows/radar.yml`
- Create: `docs/RADAR.md`
- Modify: `.env.example`

- [ ] **Step 1: Add Radar environment variables**

Modify `.env.example`:

```dotenv
# App
PORT=6001

# YouTube Data API Key
# Get your API key from: https://console.cloud.google.com/
YOUTUBE_API_KEY=your_youtube_api_key_here

# Newsletter
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=

# Turso
TURSO_URL=
TURSO_AUTH_TOKEN=

# Radar 2.0
LAST30DAYS_CLI=/Users/aaronguo/.agents/skills/last30days/scripts/last30days.py
BRAVE_API_KEY=
SCRAPECREATORS_API_KEY=
OPENAI_API_KEY=
XAI_API_KEY=
OPENROUTER_API_KEY=
APIFY_API_TOKEN=
AUTH_TOKEN=
CT0=
```

- [ ] **Step 2: Add GitHub Actions workflow**

Create `.github/workflows/radar.yml`:

```yaml
name: Radar 2.0

on:
  workflow_dispatch:
    inputs:
      topic:
        description: "Optional Radar topic slug"
        required: false
        type: string
      cadence:
        description: "Optional cadence filter"
        required: false
        type: choice
        options:
          - daily
          - weekly
  schedule:
    # 08:00 Edmonton time during daylight saving time is 14:00 UTC.
    - cron: "0 14 * * *"
    # Weekly deep-style run window. Runner filters by cadence.
    - cron: "0 15 * * 1"

jobs:
  radar:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: false

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pnpm install

      - name: Checkout last30days
        uses: actions/checkout@v4
        with:
          repository: mvanhorn/last30days-skill
          path: .last30days-skill

      - name: Run Radar
        env:
          LAST30DAYS_CLI: ${{ github.workspace }}/.last30days-skill/skills/last30days/scripts/last30days.py
          TURSO_URL: ${{ secrets.TURSO_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
          BRAVE_API_KEY: ${{ secrets.BRAVE_API_KEY }}
          SCRAPECREATORS_API_KEY: ${{ secrets.SCRAPECREATORS_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          APIFY_API_TOKEN: ${{ secrets.APIFY_API_TOKEN }}
          AUTH_TOKEN: ${{ secrets.AUTH_TOKEN }}
          CT0: ${{ secrets.CT0 }}
        run: |
          if [ -n "${{ inputs.topic }}" ]; then
            pnpm radar:run --topic "${{ inputs.topic }}"
          elif [ -n "${{ inputs.cadence }}" ]; then
            pnpm radar:run --cadence "${{ inputs.cadence }}"
          elif [ "${{ github.event.schedule }}" = "0 15 * * 1" ]; then
            pnpm radar:run --cadence weekly
          else
            pnpm radar:run --cadence daily
          fi

      - name: Upload raw Radar artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: radar-raw
          path: .data/radar/raw
          if-no-files-found: ignore
```

After creating this file, verify the checked-out `last30days` path. If the repository layout differs, adjust `LAST30DAYS_CLI` to the actual `scripts/last30days.py` location before committing.

- [ ] **Step 3: Add operations docs**

Create `docs/RADAR.md`:

```md
# Radar 2.0

Radar 2.0 is the information integration layer behind `/signal`.

It uses `last30days` for multi-source research, normalizes the JSON output, stores public link-level signals in Turso, and keeps blog publishing separate.

## Local Commands

List topics:

```bash
pnpm radar:topics
```

Run a dry-run for one topic:

```bash
pnpm radar:run --topic mobile-ai --dry-run
```

Run one topic and write to Turso:

```bash
pnpm radar:run --topic mobile-ai
```

Run due daily topics:

```bash
pnpm radar:run --cadence daily
```

Inspect database schema:

```bash
pnpm radar:diagnose
```

Apply Radar schema:

```bash
pnpm radar:migrate
```

## Required Environment

- `TURSO_URL`
- `TURSO_AUTH_TOKEN`
- `LAST30DAYS_CLI`

## Optional Source Environment

- `BRAVE_API_KEY`
- `SCRAPECREATORS_API_KEY`
- `OPENAI_API_KEY`
- `XAI_API_KEY`
- `OPENROUTER_API_KEY`
- `APIFY_API_TOKEN`
- `AUTH_TOKEN`
- `CT0`

Missing optional source credentials reduce coverage but should not block Radar entirely.

## Publishing Boundary

Radar writes structured public links and short summaries to `/signal`.

Radar does not write files under `content/blogs`.

Radar does not update RSS.

Blog posts remain manually authored.

## First Production Run

1. Confirm `.env` or GitHub secrets include Turso credentials.
2. Run `pnpm radar:diagnose`.
3. Run `pnpm radar:migrate`.
4. Run `pnpm radar:run --topic mobile-ai --dry-run`.
5. Review raw output and normalized item count.
6. Run `pnpm radar:run --topic mobile-ai`.
7. Open `/signal` and verify items, pulse, filters, and freshness.
```

- [ ] **Step 4: Run lint and workflow YAML parse check**

Run:

```bash
pnpm run lint
python3 - <<'PY'
from pathlib import Path
path = Path('.github/workflows/radar.yml')
text = path.read_text()
assert 'schedule:' in text
assert 'workflow_dispatch:' in text
assert 'pnpm radar:run' in text
print('radar workflow ok')
PY
```

Expected: lint passes and the Python check prints `radar workflow ok`.

- [ ] **Step 5: Commit Task 10**

Run:

```bash
git add .env.example .github/workflows/radar.yml docs/RADAR.md
git commit -m "chore: document and schedule radar"
```

## Task 11: End-to-End Verification

**Files:**
- Modify only files required by failures found during verification.

- [ ] **Step 1: Run the full unit test suite**

Run:

```bash
pnpm run test
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 3: Run static generation**

Run:

```bash
pnpm run generate
```

Expected: PASS. `/signal` and `/zh/signal` remain ignored by prerender.

- [ ] **Step 4: Run local Radar dry-run**

Run:

```bash
pnpm radar:run --topic mobile-ai --dry-run
```

Expected: command exits 0 and prints JSON with `ok: true`, `topicSlug: "mobile-ai"`, and a non-negative `itemsSeen`.

If this command fails because optional `last30days` credentials are missing, run:

```bash
python3.12 /Users/aaronguo/.agents/skills/last30days/scripts/last30days.py --diagnose
```

Expected: the diagnose output lists available sources. Record the source limitation in the final implementation summary.

- [ ] **Step 5: Run migration only after confirming Turso target**

Run:

```bash
pnpm radar:diagnose
```

Expected: command exits 0 and prints current tables. Confirm the target is the intended Turso database.

Then run:

```bash
pnpm radar:migrate
```

Expected: command exits 0 and prints `{ "ok": true, "action": "migrated" }`.

- [ ] **Step 6: Run one write-enabled topic**

Run:

```bash
pnpm radar:run --topic mobile-ai
```

Expected: command exits 0 and writes Radar rows to Turso.

- [ ] **Step 7: Start the dev server**

Run:

```bash
pnpm run dev
```

Expected: Nuxt dev server starts and prints a local URL.

- [ ] **Step 8: Verify `/signal` manually**

Open the local `/signal` URL.

Expected:

- Page loads without server errors.
- Pulse block renders if a pulse exists.
- Topic filter appears when API returns topics.
- Source filter still works.
- Category filter still works.
- Search still works.
- Items link out to original URLs.
- Blog pages and RSS are unchanged.

- [ ] **Step 9: Commit verification fixes**

If verification required fixes, commit them:

```bash
git add <changed-files>
git commit -m "fix: complete radar verification"
```

If no fixes were needed, do not create an empty commit.

## Final Implementation Notes

When implementation is complete, the final summary must include:

- Commands run and whether they passed.
- Any `last30days` source limitations from `--diagnose`.
- Whether Turso migration was applied.
- Whether a write-enabled Radar run was completed.
- The local URL used to verify `/signal`, if a dev server was started.
