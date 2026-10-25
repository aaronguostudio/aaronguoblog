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
