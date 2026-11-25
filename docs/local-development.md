# Local-first verification and delivery

Routine tests, linting and builds run on the maintainer's workstation. Vercel
builds the production delivery artifact from committed `main`. Explicit cloud
verification remains available for environment comparisons and external review.

## Local commands

Use Node 24 and pnpm 11.2.2, matching package.json and the production environment:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm run verify:local
```

The local gate runs deployment-policy regressions, the bilingual blog catalog
check, Vitest in non-watch mode with at most two workers, lint, and Nuxt build.
The existing `test` command remains interactive for development. The default
gate does not also run `nuxt generate`: that is a separate static-export target,
not a second required build for every normal Vercel release.

For changes affecting the standalone static export or Radar publisher:

```sh
corepack pnpm run verify:static
```

This adds the existing generate check after the local gate. The local Radar
publisher already validates generation before committing its snapshot. Its
cadence, provider calls, snapshot generation and deployment verification are
unchanged. Ordinary validation must not start a real Radar/provider run or use
production service credentials; provider tests use fixtures/mocks.

For interactive review use `corepack pnpm run dev -- --host 127.0.0.1`.
Browser/device/visual acceptance remains a separate appropriate check when UI
changes. A successful local build does not prove production or customer acceptance.

## Refresh the Signal reading desk

Use the America/Edmonton issue date. Check origin/main and the production dated
page for an existing issue before selecting stories. Confirm the evening run from
the digest receipt and Notion intake, including a completed run with zero additions.
Match the rolling export to the run. Compare all three sessions and previous editions
by event and original URL. Leave Notion reading status and Drive permissions intact.

Download the current private `signal-feed.json` from the digest's fixed Drive file.
Keep that export outside this repository. Copy a dated snapshot from `data/signal/editions/` to a
working selection file. Set the edition date, write the English and Chinese copy,
and select exactly three distinct Notion picks for one theme by their feed IDs. Choose a `cover` for the theme of the issue:
`atlas` connects related readings, `eclipse` features a single event,
`fieldnotes` suits a close reading, and `aurora` follows a sequence of sources. Use the source record's primary URL or
one of its attached evidence links for `evidence`.

```sh
node scripts/signal/import-edition.mjs /private/signal-feed.json /private/selection.json
```

Read all three primary sources before writing the bilingual `signal` for the edition.
Use `claim` for one defensible inference, `reasoning` for the concrete observations
that connect the readings and any limitations, and `nextCheck` for a comparison or
result that could change that inference. Compare with the previous issue before
calling a pattern new. The edition date and its three evidence links travel with
the finding into the archive. Radar timestamps describe the separate radar digest.

The importer checks every selected record and writes the public edition only
after all three records pass. Each date has one snapshot. Importing the same
selection again is safe. A different selection with an existing date is rejected
to protect the archived edition. The newest date appears on the Signal landing
page, and every snapshot has a stable `/signal/editions/YYYY-MM-DD` URL linked
from `/signal/editions`. Review the index and edition in English and Chinese
(`/zh/signal/editions`) before publication. The
Drive file is a rolling window, so an older selection can require a full archive
export. A digest refresh does not publish a website revision.

Run `pnpm run verify:local` on the integrated revision. Exercise all three
source controls, check both languages on the latest, date and archive pages,
and repeat the page checks on the real domain after verifying the Git/main
deployment SHA. Resume a pending release from its existing commit and date.

## Cloud triggers

| Event | Work |
| --- | --- |
| PR or main push | Small dependency-free deployment-policy regression job |
| Manual Node.js CI dispatch | Same complete `verify:local` command |
| Manual dispatch with static_export | Also run static generation |
| Feature branch push | No automatic Vercel Git Preview |
| Affected main push | One Vercel build and Git deployment |
| Docs/tests/repository metadata only | Skip the Vercel build |

Manual non-production Previews remain possible when explicitly needed. No
credentials or self-hosted GitHub runner are introduced on the workstation.
Full lint/test/build success is a local process gate, not an automatic protected
branch gate. Recheck the exact reviewed revision before a separately authorized
merge/release; later edits invalidate earlier results.

## Build inputs and Radar

`scripts/vercel-ignore-build.mjs` compares the last successfully deployed SHA
with the current checkout SHA, including all accumulated intervening changes.
It skips only known documentation/test/metadata changes. New paths, runtime
source, dependencies, build scripts and configuration all build conservatively.
Deleting/moving runtime input also triggers a build. Missing/divergent history,
unknown baselines and same-SHA settings redeployments build rather than skip.

`public/radar/latest.json` is imported into the static snapshot composable and
prerendered homepage/Signal content. Radar-only commits still need a Git build
under the current architecture. Skipping them would risk stale rendered HTML.
Separating data delivery from app releases is a future architecture change,
not part of this trigger/local-validation refactor.

## Rollout and rollback

Review the diff and local evidence, then use the separately authorized main/Git
release flow. Inspect effective Vercel build command overrides before rollout.
Afterwards verify Git source/main/SHA, real-domain content, a docs-only skip,
an affected build and absence of automatic feature Previews. A repository change
alone is not evidence that these settings are live.

The lightweight build source guard rejects production builds without a main
Git revision. It is separate from the removed historical SQLite rebuild step;
native dependency preparation remains owned by the pinned pnpm install graph.

Revert configuration through a reviewed main commit if necessary. To recover
from an incorrect skip, correct the skip rules and commit the script to main;
script changes are themselves build inputs. Never bypass the production policy
with local uploads, promotions or alias swaps. Report measured per-project CPU
minutes and cost after rollout; deployment count is not a dollar estimate.

### Mirror the GrokBot Radar

Download the fixed private Drive file `radar-public.json` to a temporary directory.
After a completed collection, run `node scripts/signal/import-radar.mjs /private/radar-public.json`
from a current website checkout. The importer validates the public projection and
atomically replaces `public/radar/latest.json`. Both the Signal workbench and
homepage read that snapshot. Earlier dated Radar files remain available as archives.
Publish the changed snapshot through Git on main. Verify its generation timestamp
and a headline on both production Signal pages. The separate editorial feed
`signal-feed.json` supplies the three selections for the daily edition.
