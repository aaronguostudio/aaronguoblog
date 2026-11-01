import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('sandboxed Monday Radar publisher', () => {
  it.each(['weekly fails', 'daily fails', 'all succeed'])('%s', (scenario) => {
    const sandbox = mkdtempSync(join(tmpdir(), 'radar-publish-'))
    try {
      mkdirSync(join(sandbox, 'scripts/radar'), { recursive: true })
      mkdirSync(join(sandbox, 'bin'))
      const script = join(sandbox, 'scripts/radar/publish-local.sh')
      copyFileSync(new URL('../../scripts/radar/publish-local.sh', import.meta.url), script)
      const stub = (name, body) => writeFileSync(join(sandbox, 'bin', name), `#!/bin/bash\n${body}\n`, { mode: 0o755 })
      stub('pnpm', `
echo "pnpm $*" >> "$SANDBOX/calls.log"
if [[ "$FAIL_WEEKLY" = 1 && ( "$*" == *"--cadence weekly"* || "$*" == *"deep-read"* ) ]]; then exit 1; fi
if [[ "$FAIL_DAILY" = 1 && "$*" == *"--cadence daily"* ]]; then exit 1; fi
exit 0`)
      stub('git', `
echo "git $*" >> "$SANDBOX/calls.log"
if [[ "$*" = "branch --show-current" ]]; then echo main; fi
if [[ "$*" = "diff --cached --quiet" ]]; then
  count=0
  if [[ -f "$SANDBOX/counter" ]]; then read -r count < "$SANDBOX/counter"; fi
  echo "$((count + 1))" > "$SANDBOX/counter"
  if [[ "$count" -gt 0 ]]; then exit 1; fi
fi
exit 0`)
      stub('date', 'if [[ "$*" = "+%u" ]]; then echo 1; else exec /bin/date "$@"; fi')
      const result = spawnSync('/bin/bash', [script], {
        env: {
          PATH: `${sandbox}/bin:/usr/bin:/bin`,
          SANDBOX: sandbox,
          RADAR_ENV_FILE: '/dev/null',
          RADAR_SKIP_DEPLOY_VERIFY: '0',
          FAIL_WEEKLY: scenario === 'weekly fails' ? '1' : '0',
          FAIL_DAILY: scenario === 'daily fails' ? '1' : '0',
        },
        encoding: 'utf8',
      })
      const calls = readFileSync(join(sandbox, 'calls.log'), 'utf8')
      const warningFile = join(sandbox, '.data/radar/publish-warnings.log')
      expect(result.error).toBeUndefined()
      expect(result.status).toBe(scenario === 'daily fails' ? 1 : 0)
      if (scenario === 'daily fails') {
        expect(calls).not.toContain('pnpm radar:export')
        expect(calls).not.toContain('git push')
      } else {
        for (const step of ['pnpm radar:export', 'pnpm run generate', 'git commit', 'git push origin main', 'pnpm radar:verify-deploy']) {
          expect(calls).toContain(step)
        }
        expect(calls.indexOf('pnpm radar:verify-deploy')).toBeGreaterThan(calls.indexOf('git push origin main'))
      }
      if (scenario === 'weekly fails') {
        const warnings = readFileSync(warningFile, 'utf8').trim().split('\n')
        expect(warnings).toHaveLength(2)
        for (const step of ['weekly run', 'weekly deep-read']) {
          expect(result.stderr).toContain(`Radar WARN: ${step} failed (exit 1); continuing with daily export.`)
        }
        expect(warnings.every(line => /^\[\d{4}-\d{2}-\d{2}T.*Z\] Radar WARN:/.test(line))).toBe(true)
      } else {
        expect(existsSync(warningFile)).toBe(false)
      }
    } finally {
      rmSync(sandbox, { recursive: true, force: true })
    }
  })
})
