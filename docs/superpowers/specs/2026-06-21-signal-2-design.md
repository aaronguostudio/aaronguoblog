# Signal 2.0 Design

Date: 2026-06-21
Status: Draft for user review
Owner: Aaron Guo

## Summary

Signal 2.0 turns the existing Signal/Radar surface from a useful AI and technology link feed into Aaron's public AI-native product research desk.

The current system is good at collecting and publishing signals. The next step is to make those signals legible as judgment: what changed, why it matters, what pattern is emerging, and what product hypothesis it suggests.

The product direction is:

- Keep the raw feed as evidence.
- Add an interpreted layer that explains why selected signals matter.
- Group repeated signals into research threads.
- Publish a weekly brief that converts the week's signals into insight.
- Use the strongest threads to generate product hypotheses for Aaron's solo AI product studio.

Signal should not become a generic AI news site. Its advantage is Aaron's perspective as an AI-native builder: someone using coding agents, workflows, automation, and product thinking in real work.

## Current Context

The repo already has the foundation for Signal:

- `/signal` renders a public feed with source, category, topic, search, pulse, and item browsing.
- `components/main/signal.vue` previews Signal on the homepage.
- `scripts/radar` collects, normalizes, scores, exports, and publishes static Radar snapshots.
- `public/radar/latest.json` is the SSG-friendly data source.
- A scheduled local publisher runs Radar, exports the snapshot, verifies the build, commits it, pushes it, and verifies the deployed Signal page.

The missing layer is not more ingestion. The missing layer is interpretation.

Today Signal mostly answers:

- What links did Radar find?
- Which topic/source/category do they belong to?
- What did the AI summary say?

Signal 2.0 should answer:

- What changed?
- Why does it matter?
- What pattern is this part of?
- What should a builder, founder, product lead, or small team pay attention to?
- What could Aaron build or productize from this?

## Product Positioning

Signal is Aaron's public research system for AI-native work.

Reader-facing positioning:

> Signal tracks the public signals I use to understand AI-native work: coding agents, small-team automation, consumer AI products, workflow design, and product opportunities. The feed is evidence. The briefs and threads are my read on what matters.

Internal positioning:

> Signal is the input layer for Aaron's product studio. It helps transform public signals into insights, research directions, essays, playbooks, and product hypotheses.

This framing is intentionally smaller and more credible than trying to be a media company. The goal is not to cover all AI news. The goal is to build a high-quality public research trail around the questions Aaron is already trying to answer.

## Audience

Primary readers:

- Solo builders trying to understand how AI changes product development.
- Small-team founders and operators looking for practical AI-native leverage.
- Product and engineering leads trying to distinguish durable workflow changes from hype.
- Domain experts who want to turn consulting or service knowledge into repeatable products.
- Readers who trust Aaron's judgment because he is building in public, not merely commenting from the outside.

These readers do not need a high-volume news feed. They need a clearer read on what matters and why.

## Core Model

Signal 2.0 has four layers.

### 1. Raw Signal

This is the existing feed: source, link, title, summary, AI summary, relevance, score, topic, category, and date.

Raw Signal is the evidence layer. It should stay available so readers can inspect the original material.

### 2. Interpreted Signal

Selected high-quality signals get a short judgment note. This note should be authored or explicitly approved by Aaron, not treated as fully automated truth.

Recommended fields:

- `What changed`: one sentence describing the concrete event or shift.
- `Why it matters`: one sentence explaining the implication.
- `Builder implication`: one sentence for people building products, workflows, or small-team systems.
- `Confidence`: low, medium, or high.

This layer is where the page starts to become insight rather than aggregation.

### 3. Research Thread

Repeated interpreted signals are grouped into ongoing research threads.

Example threads:

- Coding agents are becoming work coordinators, not just coding assistants.
- Solo builders are approaching small-team output.
- Internal workflows are becoming product candidates.
- Consumer AI apps struggle with retention, but workflow-native AI is getting stronger.
- The next advantage is not prompting, but operating systems around agents.

Each thread should include:

- A short thesis.
- Current confidence.
- Supporting signals.
- Open questions.
- Related posts or playbooks.
- Possible product hypotheses.

Research threads are the main new public surface for Signal 2.0.

### 4. Product Hypothesis

The strongest research threads should produce product hypotheses.

Examples:

- Team Signal: a configurable intelligence brief for small teams.
- Agent Operating Contract: templates and workflows for managing long-running coding agents.
- Signal-to-Insight Pipeline: a reusable research workflow for builders and creators.
- AI Workflow Audit: a lightweight service/product hybrid for teams trying to identify where AI actually creates leverage.

This layer connects the blog to Aaron's future product studio.

## First-Version User Experience

The first version should be compact. Do not rebuild the whole site around Signal yet.

### Homepage Signal Preview

Keep the existing Signal card, but adjust its framing.

Recommended copy direction:

> Daily signals from my AI-native product research desk.

The card should show:

- Today's Pulse.
- Three high-signal links.
- A link to Signal.
- Optional: one current research thread label.

### Signal Page Hero

The page should make the value proposition explicit.

Recommended structure:

- Title: Signal
- Subtitle: Public research desk for AI-native work.
- Supporting copy: Signal tracks the sources I use to understand coding agents, AI-native workflows, small-team automation, and product opportunities. Raw links are evidence; threads and briefs are my interpretation.

### What I'm Watching

Add a top section below the pulse:

`What I'm Watching`

This section lists three to five active research threads. Each thread card should show:

- Thread title.
- One-sentence thesis.
- Current confidence.
- Three supporting signals or a count.
- Last updated date.
- Link to explore the thread.

This is the most important first-version addition. It gives readers the insight layer immediately.

### Feed

Keep the current raw feed. It should remain searchable and filterable by source, topic, and category.

Default ranking should favor high-quality items. Low-information items should be demoted or visually secondary so they do not dilute the page's credibility.

## Weekly Brief

Signal 2.0 should include a weekly editorial artifact:

`Signal Brief: What I'm Seeing This Week`

Recommended format:

1. The strongest signal.
2. The pattern behind it.
3. Why it matters for builders.
4. What Aaron is skeptical about.
5. What Aaron might build because of this.

The weekly brief can be a normal blog post, a dedicated Signal brief page, or both. The first version can start as a blog post series to avoid building a new publishing system too early.

## Content Workflow

Daily:

- Radar collects and publishes raw signals.
- Aaron optionally marks a few items as worth interpreting.

Weekly:

- Review the strongest signals.
- Update research thread confidence and supporting evidence.
- Publish one brief.
- Identify one possible product hypothesis or experiment.

Monthly:

- Review which threads are gaining evidence.
- Decide whether one thread deserves a deeper essay, playbook, or product experiment.

## Data and Content Model

First implementation should keep data simple.

Recommended initial content model:

- Keep raw Radar snapshot unchanged.
- Add a small repo-owned editorial layer for threads and interpretations.
- Store the editorial layer as versioned content, likely JSON or Markdown, before adding database/admin complexity.

Possible file structure:

```text
data/signal/threads.ts
data/signal/interpretations.ts
content/blogs/en/signal-brief-*.md
content/blogs/zh/signal-brief-*.md
```

The editorial layer should reference Radar items by stable IDs or URLs where possible, but it should not require old Radar items to remain forever present in `latest.json`.

## Quality Bar

Signal 2.0 should feel more like a thoughtful research desk than a scraped feed.

Quality rules:

- A signal is only promoted when it teaches something or supports a thread.
- A thread must have a clear thesis, not just a topic label.
- A weekly brief must contain Aaron's judgment, not only AI summaries.
- Low-information posts can remain in raw feed but should not lead the page.
- Any claim that sounds like strategy should be grounded in visible supporting signals.

## Non-Goals

The first version should not:

- Become a general AI news destination.
- Auto-generate long-form insights without Aaron's review.
- Add a full admin UI.
- Add paid subscription infrastructure.
- Build a separate database for editorial notes unless static content becomes painful.
- Support every topic in AI. It should stay focused on Aaron's product-studio questions.

## Success Criteria

Signal 2.0 is working if:

- A new reader can tell within 30 seconds what Aaron is watching and why.
- The page contains at least three clear research threads.
- Each research thread links back to real signals.
- The weekly brief creates a repeatable habit without requiring a large essay every time.
- Signal starts producing article ideas, playbooks, or product hypotheses.
- Readers understand Aaron's judgment, not just his information sources.

## Recommended First Slice

Build the smallest version that proves the insight layer:

1. Add static research thread data for three initial threads.
2. Add a `What I'm Watching` section to `/signal`.
3. Link each thread to supporting raw signals.
4. Adjust the homepage Signal copy to frame Signal as a research desk.
5. Publish the first `Signal Brief`.

This slice is intentionally narrow. It upgrades Signal's meaning without forcing a large backend change.
