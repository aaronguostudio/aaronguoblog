# Signal Research Desk Redesign

Date: 2026-06-21
Status: Draft for user review
Owner: Aaron Guo

## Summary

The Signal page should become Aaron's public research product for AI-native work, not a normal blog subpage and not a generic link feed.

The current Signal content is directionally strong: daily pulse, research threads, Signal Briefs, and raw evidence already exist. The weakness is presentation. The page is too narrow, visually quiet, and ordered like a basic content page. It does not yet make Signal feel like an important product surface.

This redesign upgrades `/signal` into a wider, more structured research desk:

- A stronger first screen that explains the product and shows the system is alive.
- A clearer hierarchy from Aaron's judgment to supporting evidence.
- More useful visual density without becoming a busy dashboard.
- Better separation between Pulse, Research Threads, Briefs, and Evidence Feed.
- A wider layout that uses desktop space while remaining readable on mobile.

## Product Positioning

Signal is Aaron's public research desk for AI-native work.

Reader-facing promise:

> I track public signals about coding agents, AI-native workflows, small-team leverage, and product opportunities. The raw links are evidence. The threads and briefs are my interpretation.

This positioning should feel credible for Aaron's current stage. Signal should not pretend to be a large media company. It should feel like a thoughtful builder's research system that is already useful today and can grow into a product later.

## Audience

Primary readers:

- Solo builders who want to understand what AI changes in product building.
- Small-team founders and operators looking for AI-native leverage.
- Product and engineering leads trying to separate durable workflow shifts from noise.
- Readers who may eventually trust Aaron's product judgment because they can see the research trail.

These readers need a strong point of view first and raw evidence second. The feed should remain inspectable, but the page should lead with interpretation.

## Design Direction

The selected direction is **Live Research Desk**.

The page should feel like a calm, working research surface:

- Wider than the current `max-w-5xl` page.
- Structured like a public intelligence desk, not a marketing landing page.
- Editorial enough to invite reading, but operational enough to show the system is live.
- Mostly neutral, with restrained accent colors from existing source/category colors.
- Dense, but not cramped.

Avoid:

- A decorative hero or large marketing splash.
- A one-note purple, blue, beige, or dark slate palette.
- Card-on-card layouts.
- Hiding the raw feed so deeply that Signal loses its evidence layer.
- Rebuilding the data model, Radar ingestion, or pre-render workflow.

## Page Structure

### 1. Research Desk Hero

Replace the current narrow hero with a wide first screen section.

Desktop layout:

- Left: product title, live status, short positioning, and two or three concise product promises.
- Right: a compact operations panel showing source mix, latest run/update age, item count, and pulse date.

The hero should make three things immediately clear:

- Signal is a productized research surface.
- Aaron is interpreting signals, not only collecting links.
- The underlying feed is fresh and evidence-backed.

Mobile layout:

- Stack title, description, pulse/status facts, and source mix vertically.
- Keep the hero compact enough that the daily pulse is visible without excessive scrolling.

### 2. Today's Pulse

Keep Today's Pulse near the top, but make it more prominent and easier to scan.

Changes:

- Present it as the daily readout from the research desk.
- Give the pulse text more breathing room and stronger type.
- Keep the top five pulse items visible as supporting evidence.
- Preserve external links and category/source labels.

Today's Pulse should answer: what is the desk seeing today?

### 3. Research Threads

Keep `What I'm Watching`, but redesign it as the main insight layer.

Changes:

- Use a wider section with stronger section header copy.
- Make each thread card feel like an active thesis, not a plain content card.
- Preserve confidence, thesis, builder implication, supporting signals, open question, and product hypothesis.
- Improve hierarchy inside each card so the title, thesis, and product hypothesis are easy to find.

This section should answer: what patterns is Aaron actively testing?

### 4. Signal Briefs

Keep Signal Briefs separate from Writing and place them after Research Threads.

Changes:

- Make the latest brief feel like an editorial memo produced by the research desk.
- Use a wider article layout with the brief's sections grouped into readable blocks.
- Avoid making the brief look like a blog post embedded inside another page.

This section should answer: what has Aaron concluded from recent signals?

### 5. Evidence Feed

Keep the raw feed as the evidence layer and preserve existing interactions:

- Source filters.
- Category filters.
- Radar topic filters.
- Search.
- Load more.
- Static snapshot first, API fallback.

Visual changes:

- Rename or frame the area as Evidence Feed.
- Keep the toolbar sticky but make it feel integrated into the section.
- Use a wider feed layout on desktop, with more polished item rows.
- Keep source/category chips compact and readable.

This section should answer: what evidence supports the research desk?

## Component Boundaries

The redesign should keep code understandable by introducing presentational boundaries rather than bloating `pages/signal.vue`.

Recommended components:

- `components/signal/Hero.vue`
  - Owns the research desk hero and source mix panel.
  - Receives stats, total count, latest run, pulse date, and localized text as props.

- `components/signal/Pulse.vue`
  - Owns Today's Pulse rendering.
  - Receives pulse text/date/items and helper label functions/classes as props.

- Existing `components/signal/ResearchThreads.vue`
  - Keep data-fetching out of the component.
  - Upgrade visual treatment only.

- Existing `components/signal/Briefs.vue`
  - Keep brief data rendering separate from Writing.
  - Upgrade visual treatment only.

- `pages/signal.vue`
  - Keeps data fetching, filtering state, computed data, and helper functions.
  - Should become a coordinator rather than owning all major markup.

Do not introduce a global design system for this redesign. Use existing Tailwind tokens and localized strings.

## Data Flow

The redesign should not change the Signal data model.

Existing flow stays intact:

1. Static Radar snapshot loads through `useStaticRadarSnapshot('signal-radar-latest')`.
2. API fetches remain a development/runtime fallback.
3. Static items are mapped into `SignalItem`.
4. Filters operate on the static snapshot when available.
5. Research threads resolve against unfiltered research items.
6. Briefs load from `data/signal/briefs.ts`.

The redesign may add small computed values for presentation:

- Top source stats.
- Latest update label.
- Hero metric cards.
- Section labels.

These computed values should not create a second data source.

## Localization

All new reader-facing copy must go through `i18n/locales/en-US.json` and `i18n/locales/zh-CN.json`.

Expected new or revised copy:

- Research desk hero eyebrow and description.
- Hero promise bullets or metric labels.
- Operations panel labels.
- Evidence Feed heading and description.
- Updated Pulse, Research Threads, and Briefs supporting copy if needed.

Chinese copy should sound natural and product-facing, not like a direct machine translation.

## Visual Quality Bar

The upgraded page should meet these standards:

- Desktop width should feel materially wider than the current screenshot.
- First screen should establish Signal as a product, not just a section.
- Section hierarchy should be obvious at a glance.
- Text should not overflow buttons, cards, chips, or narrow mobile containers.
- No card should contain another card-like page section.
- Repeated item cards may be framed; page-level sections should use bands or unframed constrained layouts.
- Dark mode should remain usable.
- Existing source and category colors can be used as small accents, not as a dominant palette.

## Testing and Verification

Implementation should include:

- Contract tests that confirm the Signal page uses the new Signal-specific components.
- Existing Signal Brief tests continue to ensure briefs stay out of Writing.
- Utility tests remain unchanged unless computed presentation helpers are extracted.
- `pnpm exec vitest run` passes.
- `pnpm run lint` passes.
- `pnpm run generate` passes.

Manual or browser verification should check:

- Desktop Signal page at a wide viewport.
- Mobile Signal page.
- Light mode.
- Dark mode.
- Filters, search, and load more still work.
- Signal Briefs remain on `/signal` only.
- Writing still shows the Tesla article as the latest post.

## Non-Goals

This redesign will not:

- Add an admin UI.
- Add a new database.
- Change Radar ingestion, scoring, publishing, or deployment jobs.
- Move Signal Briefs back into Writing.
- Create individual thread detail pages.
- Create a separate brief archive route.
- Add paid-product, newsletter, or account flows.

Those may become future product steps, but this iteration is about making the existing Signal page feel like a serious public research product.

## Self-Review

- No placeholders remain.
- The scope is limited to `/signal`, Signal components, localized copy, and tests.
- The design keeps the existing pre-render and static snapshot flow.
- The brief explicitly prevents Signal Briefs from returning to Writing.
- The visual direction is specific enough to implement without inventing a new site identity.
