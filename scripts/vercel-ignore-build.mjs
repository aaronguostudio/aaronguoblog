#!/usr/bin/env node
// Vercel: exit 0 skips, exit 1 builds. Unknown inputs build conservatively.
import { execFileSync } from 'node:child_process'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const build = reason => { console.log(`Build: ${reason}`); process.exit(1) }
const skip = reason => { console.log(`Skip: ${reason}`); process.exit(0) }
if (process.env.VERCEL_ENV !== 'production') build('explicit non-production build')
if (process.env.VERCEL_GIT_COMMIT_REF !== 'main') build('production branch validation must run')
const previous = process.env.VERCEL_GIT_PREVIOUS_SHA || ''
const current = process.env.VERCEL_GIT_COMMIT_SHA || ''
if (![previous, current].every(sha => /^[a-f0-9]{40}$/i.test(sha))) build('no trusted previous deployment')
if (previous === current) build('explicit redeployment may apply new project settings')
try {
  if (git('rev-parse', 'HEAD').trim() !== current) build('checkout mismatch')
  git('merge-base', '--is-ancestor', previous, current)
  const paths = git('diff', '--no-renames', '--name-only', '-z', previous, current, '--').split('\0').filter(Boolean)
  // Only explicitly non-runtime material is skippable; new/unknown paths build.
  const nonInputs = ["docs/","tests/",".github/"]
  const nonInputFiles = new Set(['README.md', 'README.zh-CN.md', 'AGENTS.md', 'LICENSE', '.gitignore'])
  const affected = paths.find(file => !nonInputFiles.has(file) && !nonInputs.some(prefix => file.startsWith(prefix)))
  if (affected) build(`runtime/configuration input changed: ${affected}`)
  skip('only documentation, test or repository metadata changed since the last deployment')
} catch {
  build('history unavailable or divergent')
}
