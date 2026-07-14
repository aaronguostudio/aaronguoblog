# Build Page Design QA

## Capture setup

- Original layout target: `/Users/aaronguo/.codex/generated_images/019f5974-f7bb-7f42-b714-b88cb03369f7/exec-27c93bb9-b7e8-4037-a502-dd74278446df.png`
- Original two-project implementation: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/build-implementation.png`
- DrumNext source visual: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/drumnext-research/timing-lab-live.png` (a real Timing Lab screen); the slot-fitted source crop is `/Users/aaronguo/Work/ag/blog/aaronguoblog/public/projects/drum-next/drum-next-timing-lab.png`.
- Final browser-rendered desktop implementation: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/build-drumnext-desktop.png`
- Final browser-rendered mobile implementation: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/build-drumnext-mobile.png`
- Viewports: original 2056 × 1168 CSS px at DPR 2; final desktop breakpoint review; final mobile 432 × 1223 CSS px at DPR 2.2. All captures used English `/build`, dark mode, after initial motion completed.
- Original full comparison: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/build-comparison.png` (source on top; original implementation below).
- DrumNext media comparison: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/drumnext-media-comparison.png` (fitted real source on top; rendered card media below).
- Focused Tesra comparison: `/Users/aaronguo/Work/ag/blog/aaronguoblog/tmp/design-qa/build-focus-tesra.png`
- Density follow-up references supplied by the user: `/Users/aaronguo/Desktop/Screenshot 2026-07-13 at 6.42.17 AM.png` (desktop) and `/Users/aaronguo/Desktop/FireShot Capture 002 - Build - Aaron Guo - [localhost].png` (mobile).
- Same-viewport density comparisons: `/tmp/design-qa/build-density/07-desktop-before-after.png` and `/tmp/design-qa/build-density/08-mobile-before-after.png`. The underlying accepted captures are `03-chrome-before-desktop.png`, `06-chrome-after-desktop.png`, `04-chrome-before-mobile.png`, and `05-chrome-after-mobile.png` in that folder.

The focused comparisons inspect real visual assets at readable scale. The DrumNext comparison confirms that its card uses the genuine Timing Lab interface, with only the signed-in sidebar removed to fit the Build slot. The desktop and mobile final captures check the complete three-project rhythm, order, spacing, footer, and responsive stack.

## Final visual assessment

- Typography and palette preserve the selected dark editorial direction: near-black canvas, restrained white type, compact metadata, and cobalt Tesra accent.
- Tesra remains the first, primary project. Asset Bento reverses the composition, and DrumNext returns to content-left / media-right so the third row does not repeat the second row's direction.
- The project-list gap is larger than the reference so future items do not crowd one another. The stagger remains perceptible without making the list feel disconnected.
- The supplied Tesra mark and horizon image are real project assets. The image is labeled `Project scene`, not represented as a product screenshot.
- DrumNext uses its official DN mark and a real Timing Lab product interface. The screenshot is cropped to omit the signed-in side rail and is accurately labeled `Timing Lab`.
- `LIVE` and `SHIPPED` labels are absent from the rendered experience, as requested. `01 / Project` through `03 / Project` retain the structure needed for a growing list.
- No actionable P0, P1, or P2 visual mismatch remains.

## Comparison history

1. **P2 — status treatment:** the selected source visual included `LIVE` and `SHIPPED`, which conflicted with the requirement that all Build entries are already published. Removed status badges and changed the introductory eyebrow to `Selected projects`.
2. **P2 — list density:** the reference’s two projects sat too tightly for a future multi-project Build page. Increased the responsive vertical separation and retained an alternating offset between projects.
3. **P1 — complete-page render state:** the secondary item could remain hidden in a full-page capture because it waited for viewport-triggered motion. Replaced that trigger with equivalent page-load motion so all projects reliably render; final capture confirms article opacities `1, 1, 1`.
4. **P1 — production render:** the async content query conflicted with the shared motion wrapper during prerendering. Moved the same motion configuration to individual page elements; the final production build prerendered successfully.
5. **P2 — third-row rhythm:** adding a third non-featured project would have repeated Asset Bento's media-left / copy-right composition. Added explicit `copy-media` and `media-copy` frontmatter so project order and alternating direction remain intentional as the list grows.
6. **P2 — truthful DrumNext visual:** the full live Timing Lab screen included a signed-in side rail. Used the real interface but cropped that side rail out at the measured 16:10 Build slot; no mock UI or substitute artwork was introduced.

## Density and mobile grouping follow-up (2026-07-13)

- The desktop Build intro now measures 258 px at 1440 × 960, down from 319 px. Its top and bottom padding were reduced from 101/58 px to 58/40 px, bringing the project collection into the first view without changing the page's hierarchy.
- At 390 × 844, the list no longer relies on a large inter-project gap. Each project has 20 px of top and 28 px of bottom breathing room; projects two and three begin with a restrained 1 px divider. This creates clear dossiers without turning the editorial layout into a stack of heavy cards.
- The image-to-project-label gap is 14 px for all three projects at mobile width, down from 32 px. This keeps each image visibly attached to its own `01 / Project`, `02 / Project`, or `03 / Project` content.
- The before/after review confirms that Tesra's image can no longer be read as belonging to Asset Bento: its section is closed by its own bottom spacing and the following divider begins the next project.
- Desktop keeps the wider, alternating project rhythm so future additions remain comfortable rather than compressed.

## Interaction and technical verification

- Tesra’s image-preview control was tested: one `Open Tesra image preview` button opened one lightbox, and `Close image preview` removed it (`1 → 0`).
- The primary CTA resolves to `https://tesra.art/`; it was not navigated in QA because DNS for that site did not resolve in this environment.
- DrumNext’s image-preview control was tested: one `Open DrumNext image preview` button opened one lightbox, and `Close image preview` removed it after the exit transition (`1 → 0`). Its CTA resolves to `https://www.drumnext.com/`.
- The final browser check found three project articles, no horizontal overflow, and no rendered `LIVE` or `SHIPPED` text. The three desktop media/copy X positions were `584/48`, `48/791`, and `584/48`, confirming alternating composition.
- `/zh/build` was also checked: it renders all three localized projects, the `项目选集` eyebrow, DrumNext's Chinese description and `Timing Lab 界面` label, and no status labels.
- Final responsive reloads introduced no page-visible errors. Fresh dev-server output reported no Build runtime errors; the only warnings were the repository’s existing duplicate blog-route-name notice and stale Browserslist data.
- `pnpm exec prettier --check pages/build.vue tests/build-projects.test.ts`, `pnpm exec vitest run tests/build-projects.test.ts` (12/12), `pnpm lint`, `git diff --check`, and `pnpm build` all passed. The production build prerendered 1,041 routes, including `/build` and `/zh/build`, successfully.

## Follow-up polish

- **P3:** replace `Project scene` with a verified Tesra product Browse screenshot when the live domain becomes reachable from the build environment.

final result: passed

---

# Homepage Signal redesign QA (2026-07-13)

## Capture setup

- Source visual truth: `/Users/aaronguo/.codex/generated_images/019f5974-f7bb-7f42-b714-b88cb03369f7/exec-5e791409-3a2c-471d-9109-45dfdf65e087.png` (the user-selected Pulse Meter direction).
- Latest spacing-and-density feedback: `/var/folders/1d/36mq5p8n0472d49pmsgkd1sm0000gn/T/codex-clipboard-35fbc53c-1377-45f8-87e5-a4270b94d643.png`.
- Intended implementation: `http://127.0.0.1:4317/`, homepage Signal preview in English, light-page context, live data present.
- Intended review viewports: desktop sidebar at the homepage `lg` breakpoint and a 320–390 px mobile width.
- Browser-rendered implementation screenshot: unavailable. The local browser-control runtime failed three times before it could attach (`Cannot redefine property: process`), so no comparable desktop or mobile capture was produced.

## Findings

- [P1] Browser-rendered visual comparison is unavailable.
  - Location: homepage Signal preview.
  - Evidence: the selected dark Pulse Meter mock can be opened, but a same-state implementation screenshot cannot be captured in the current environment.
  - Impact: typography, actual card height, narrow-mobile wrapping, and the final visual match cannot be truthfully approved from source code or server HTML alone.
  - Fix: restore a working local browser connection or provide a browser-rendered desktop and mobile screenshot, then compare each against the selected mock and resolve any remaining P1/P2 drift.

## Implementation completed before visual QA

- Rebuilt the preview as a solid navy Signal read: thin blue keyline, live status dot, a changing reader-facing daily read, and linked editorial rows.
- Preserved the static Radar snapshot as the priority data source, the `/signal` View all route, and external source links.
- Keeps the three linked headlines as direct single-line rows; the repeated category/source tags and their dividers are intentionally omitted.
- Added a 44 px View all target, reduced-motion handling for the live indicator, title clamping, and a mobile fallback that keeps a row's category and headline visually grouped.
- Server-side rendering at `http://127.0.0.1:4317/` returns `200` and includes the new Signal markup. This is integration evidence only; it does not replace visual QA.

## Technical verification

- `pnpm exec prettier --check components/main/signal.vue utils/radar-snapshot.ts tests/radar-snapshot.test.ts i18n/locales/en-US.json i18n/locales/zh-CN.json` — passed.
- `pnpm exec vitest run tests/radar-snapshot.test.ts tests/radar/static-signal-contract.test.js tests/homepage-mobile-density.test.ts` — passed (20/20).
- `pnpm lint` — passed.
- `git diff --check -- components/main/signal.vue` — passed.
- Latest daily-read refinement re-ran `pnpm exec prettier --check components/main/signal.vue utils/radar-snapshot.ts tests/radar-snapshot.test.ts i18n/locales/en-US.json i18n/locales/zh-CN.json design-qa.md`, the 21 Signal/mobile-density tests, `pnpm lint`, and `git diff --check`; all passed. SSR at `http://127.0.0.1:4317/` and `/zh/` returns `Today's read` / `今日观察` plus the dynamic theme text, without the fixed item count in the rendered card. This remains integration evidence, not visual approval.

## Comparison history

1. [P1] Initial implementation used raw technical source labels for the dense desktop grid. Replaced them with `item.category` when present, preserving a human editorial label and falling back safely to the source.
2. [P2] Header controls were initially too subtle relative to the oversized pulse treatment. Increased the desktop header scale, expanded the View all touch target, and matched the mock's title case rather than forced all caps.
3. [P1] Final screenshot comparison blocked by the local browser-control runtime. No visual pass is claimed.
4. [P2] The original `05` was a fixed top-five limit rather than a meaningful daily metric. It was removed rather than replaced: source diversity is implementation detail, not reader value.
5. [P2] The supplied implementation screenshot showed an oversized count and headline consuming the upper card while the last row ended too close to the lower edge. Compressed the header-to-hero spacing, removed the repeated `AI` labels, and added a quiet final divider plus bottom breathing room.
6. [P2] The new hero previously clipped the dynamic part of the daily pulse and retained only the recurring `Radar found 5…` prefix. It now presents the changing `Top themes:` content as `Today's read`, while the three rows remain the linked evidence. This is deliberately not labeled a conclusion: the current static Radar contract does not yet persist a source-bounded daily synthesis.

## Follow-up polish

- After browser capture is restored, check the 320 px layout first; confirm the `Today's read` text and all three evidence rows remain comfortably readable without a count block.
- A true daily conclusion remains a separate Radar-pipeline enhancement: generate one source-bounded synthesis offline after the day’s evidence is finalized, then store it with the snapshot. Do not fabricate this in the client.

final result: blocked
