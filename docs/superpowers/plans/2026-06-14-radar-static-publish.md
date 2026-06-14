# Radar Static Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static Radar publishing path so scheduled Radar runs can generate SSG-friendly `/signal` data, verify it, commit it, and push it through the blog deployment pipeline.

**Architecture:** Keep Turso as the durable archive and add a static snapshot layer under `public/radar`. The Nuxt `/signal` page and homepage Signal preview read the static snapshot first, then fall back to existing SSR APIs when the snapshot is missing. Local scheduling is handled by small scripts that can be installed as a macOS LaunchAgent.

**Tech Stack:** Node.js ESM scripts, Nuxt 3, Turso/libsql, Vitest, Bash, macOS launchd.

---

### Task 1: Static Snapshot Export Core

**Files:**

- Create: `scripts/radar/static-export.js`
- Test: `tests/radar/static-export.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/radar/static-export.test.js` with tests for:

- building a snapshot from migrated in-memory Turso data
- writing `public/radar/latest.json` and `public/radar/daily/<date>.json`
- rejecting snapshots that were produced with `local-score` unless explicitly allowed

Run: `pnpm exec vitest --run tests/radar/static-export.test.js`
Expected: FAIL because `scripts/radar/static-export.js` does not exist.

- [ ] **Step 2: Implement exporter**

Create `scripts/radar/static-export.js` with these public functions:

- `buildRadarSnapshot(client, options)`
- `validateRadarSnapshot(snapshot, options)`
- `writeRadarSnapshot(snapshot, options)`
- `exportRadarSnapshot(options)`

The snapshot shape must be:

```js
{
  version: 1,
  date: 'YYYY-MM-DD',
  generatedAt: 'ISO timestamp',
  quality: { status: 'ok' | 'blocked', blockers: [], warnings: [] },
  latestRun: { id, status, startedAt, completedAt },
  pulse: { text, date, generatedAt, topItemIds },
  topics: [{ slug, name, category, cadence, mode }],
  stats: [{ source, count }],
  items: [{
    id, source, url, title, summary, aiSummary, author,
    score, relevance, category, topicSlug, createdAt, publishedAt
  }]
}
```

- [ ] **Step 3: Verify exporter tests pass**

Run: `pnpm exec vitest --run tests/radar/static-export.test.js`
Expected: PASS.

### Task 2: CLI and Package Script

**Files:**

- Modify: `scripts/radar/cli.js`
- Modify: `package.json`
- Modify: `tests/radar/cli.test.js`

- [ ] **Step 1: Write failing CLI tests**

Extend `tests/radar/cli.test.js` to assert:

- README examples include `pnpm radar:export`
- `parseArgs(['node', 'cli.js', 'export'])` returns `{ command: 'export', ... }`
- `parseArgs` supports `--allow-local-ranking`

Run: `pnpm exec vitest --run tests/radar/cli.test.js`
Expected: FAIL because CLI export is unsupported.

- [ ] **Step 2: Implement CLI**

Add `radar:export` to `package.json`:

```json
"radar:export": "node scripts/radar/cli.js export"
```

Update `scripts/radar/cli.js` so `export` calls `exportRadarSnapshot`.

- [ ] **Step 3: Verify CLI tests pass**

Run: `pnpm exec vitest --run tests/radar/cli.test.js tests/radar/static-export.test.js`
Expected: PASS.

### Task 3: SSG Signal Data Path

**Files:**

- Modify: `pages/signal.vue`
- Modify: `components/main/signal.vue`
- Modify: `nuxt.config.ts`
- Test: `tests/radar/static-signal-contract.test.js`

- [ ] **Step 1: Write failing contract tests**

Create `tests/radar/static-signal-contract.test.js` to assert:

- `public/radar/latest.json` compatible items include `topicSlug`
- `pages/signal.vue` fetches `/radar/latest.json`
- `components/main/signal.vue` fetches `/radar/latest.json`
- `nuxt.config.ts` does not ignore `/signal` or `/zh/signal` for prerender

Run: `pnpm exec vitest --run tests/radar/static-signal-contract.test.js`
Expected: FAIL until the files are updated.

- [ ] **Step 2: Update UI data loading**

Update both Signal consumers to:

- fetch `/radar/latest.json`
- use static snapshot data when present
- fall back to `/api/signal` and `/api/signal-pulse`
- preserve existing filters and display behavior

Update `nuxt.config.ts`:

- remove `/signal` and `/zh/signal` from `nitro.prerender.ignore`
- set `/signal` and `/zh/signal` to prerender-friendly route rules

- [ ] **Step 3: Verify contract tests pass**

Run: `pnpm exec vitest --run tests/radar/static-signal-contract.test.js`
Expected: PASS.

### Task 4: Local Publish Automation

**Files:**

- Create: `scripts/radar/publish-local.sh`
- Create: `scripts/radar/install-launch-agent.sh`
- Test: `tests/radar/publish-scripts.test.js`

- [ ] **Step 1: Write failing script tests**

Create `tests/radar/publish-scripts.test.js` to assert:

- `publish-local.sh` runs `radar:migrate`, `radar:run`, `radar:export`, `generate`, `git commit`, and `git push`
- `publish-local.sh` uses a lock file
- `install-launch-agent.sh` writes `com.aaronguo.radar-publish.plist`
- secrets are loaded from `$HOME/.config/aaronguo/radar.env` and are not hard-coded

Run: `pnpm exec vitest --run tests/radar/publish-scripts.test.js`
Expected: FAIL until scripts exist.

- [ ] **Step 2: Implement scripts**

Create `scripts/radar/publish-local.sh`:

- source `$HOME/.config/aaronguo/radar.env` if it exists
- acquire `.data/radar/publish.lock`
- pull latest branch with rebase/autostash
- run daily Radar
- run weekly Radar on Mondays
- export static snapshot
- run `pnpm run generate`
- commit and push only when `public/radar` changed

Create `scripts/radar/install-launch-agent.sh`:

- install `~/Library/LaunchAgents/com.aaronguo.radar-publish.plist`
- schedule at 07:30 local time
- log to `~/Library/Logs/aaronguo-radar-publish.log`

- [ ] **Step 3: Verify script tests pass**

Run: `pnpm exec vitest --run tests/radar/publish-scripts.test.js`
Expected: PASS.

### Task 5: Documentation and End-to-End Verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Update docs**

Document:

- `pnpm radar:run --cadence daily`
- `pnpm radar:export`
- `scripts/radar/publish-local.sh`
- `scripts/radar/install-launch-agent.sh`
- required local env file path

- [ ] **Step 2: Full verification**

Run:

```bash
pnpm exec vitest --run
pnpm run lint
pnpm run generate
```

Expected: all pass.

- [ ] **Step 3: Commit**

Commit all implementation files:

```bash
git add .
git commit -m "feat: add static Radar publishing"
```
