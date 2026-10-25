import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./vercel-ignore-build.mjs', import.meta.url))

test('automatic Git deployments are main-only', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
  assert.deepEqual(config.git.deploymentEnabled, { '**': false, main: true })
  assert.equal(config.ignoreCommand, 'node scripts/vercel-ignore-build.mjs')
})

test('production validation rejects a branch or missing revision and permits local work', () => {
  const guard = fileURLToPath(new URL('./validate-production-source.mjs', import.meta.url))
  const run = overrides => spawnSync(process.execPath, [guard], {
    encoding: 'utf8', env: { ...process.env, VERCEL_ENV: 'production', ...overrides },
  })
  for (const overrides of [
    { VERCEL_GIT_COMMIT_REF: 'feature/test', VERCEL_GIT_COMMIT_SHA: 'a'.repeat(40) },
    { VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_COMMIT_SHA: '' },
  ]) {
    const result = run(overrides)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Production requires a committed main Git revision/)
  }
  assert.equal(run({ VERCEL_ENV: '' }).status, 0)
  assert.equal(run({ VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_COMMIT_SHA: 'a'.repeat(40) }).status, 0)
})

test('skip only known non-runtime changes with a trustworthy deployment baseline', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'local-deployment-policy-'))
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const commit = (file, body) => {
    mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true })
    writeFileSync(path.join(cwd, file), body)
    git('add', '--all')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'core.hooksPath=' + path.join(cwd, '.no-hooks'), 'commit', '-qm', 'fixture')
    return git('rev-parse', 'HEAD')
  }
  const run = (previous, overrides = {}) => spawnSync(process.execPath, [script], {
    cwd, encoding: 'utf8',
    env: { ...process.env, VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_COMMIT_SHA: git('rev-parse', 'HEAD'), VERCEL_GIT_PREVIOUS_SHA: previous, ...overrides },
  })
  try {
    git('init', '-q')
    let base = commit("public/radar/latest.json", 'runtime')
    commit('docs/example.md', 'documentation')
    assert.equal(run(base).status, 0)
    commit("composables/future-input.ts", 'new input')
    commit('README.md', 'later documentation')
    assert.equal(run(base).status, 1, 'accumulated runtime changes must build')
    base = git('rev-parse', 'HEAD')
    git('mv', "public/radar/latest.json", 'docs/moved-runtime.txt')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'core.hooksPath=' + path.join(cwd, '.no-hooks'), 'commit', '-qm', 'move runtime out')
    assert.equal(run(base).status, 1, 'runtime deletion or cross-directory rename must build')
    assert.equal(run('').status, 1, 'first deployment')
    assert.equal(run('a'.repeat(40)).status, 1, 'missing history')
    assert.equal(run(git('rev-parse', 'HEAD')).status, 1, 'same SHA settings redeploy')
    assert.equal(run(base, { VERCEL_GIT_COMMIT_SHA: 'b'.repeat(40) }).status, 1, 'checkout mismatch')
    assert.equal(run(base, { VERCEL_ENV: 'preview' }).status, 1, 'explicit preview')
    assert.equal(run(base, { VERCEL_GIT_COMMIT_REF: 'feature/test' }).status, 1, 'production branch guard')
  } finally { rmSync(cwd, { recursive: true, force: true }) }
})
