# Development and deployment

Daily development and verification run locally. Use Node 24 and the pinned pnpm
version. Run `pnpm run verify:local` after the last relevant edit; use
`pnpm run verify:static` only when validating a standalone static export.
See `docs/local-development.md` for the complete flow and evidence boundaries.

Keep automatic Git deployments main-only. The ignored-build script skips only
explicit documentation/test/repository metadata paths. Unknown paths build,
and `public/radar/**` must always be treated as website input: the snapshot is
compiled into prerendered pages. Do not skip Radar updates to reduce build costs
or move its data/providers/schedule without a separate selected increment.

Vercel runs the website build, not the local acceptance suite. Full GitHub build
verification is manual; ordinary PR/main events check the deployment policy.
Local evidence is the maintainer's release gate and must match the reviewed
revision. Preserve bilingual content, current publishing behavior and public URLs.

Production must come only from a Git-triggered deployment of committed `main`.
Never use local production deploys, promotion or alias swaps. Verify Git/main/
expected-commit provenance and the actual domain before claiming a release.
Implementation or local testing does not itself authorize publication.
