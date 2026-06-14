import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildLast30DaysArgs,
  parseLast30DaysJson,
  resolveLast30DaysCli,
  resolvePythonCommand,
  runLast30Days,
} from '../../scripts/radar/last30days-adapter.js'

const adapterPath = fileURLToPath(new URL('../../scripts/radar/last30days-adapter.js', import.meta.url))

describe('last30days adapter', () => {
  it('resolves explicit CLI path first', () => {
    expect(resolveLast30DaysCli({ LAST30DAYS_CLI: '/tmp/last30days.py' })).toBe('/tmp/last30days.py')
  })

  it('resolves default CLI from the current home directory', () => {
    expect(resolveLast30DaysCli({})).toBe(join(homedir(), '.agents/skills/last30days/scripts/last30days.py'))
    expect(readFileSync(adapterPath, 'utf8')).not.toContain('/Users/aaronguo')
  })

  it('allows Python command override', () => {
    expect(resolvePythonCommand({ LAST30DAYS_PYTHON: 'python3.13' })).toBe('python3.13')
  })

  it('builds safe args for a quick topic run', () => {
    const args = buildLast30DaysArgs({
      topic: {
        query: 'mobile AI',
        mode: 'quick',
        lookbackDays: 30,
        sourceHints: {
          subreddits: ['LocalLLaMA', 'ArtificialInteligence'],
          githubRepos: [],
          xHandles: [],
          tiktokHashtags: ['mobileai'],
          instagramCreators: [],
        },
      },
      saveDir: '.data/radar/raw',
    })

    expect(args).toEqual([
      'mobile AI',
      '--emit=json',
      '--days',
      '30',
      '--quick',
      '--save-dir',
      '.data/radar/raw',
      '--subreddits',
      'LocalLLaMA,ArtificialInteligence',
      '--tiktok-hashtags',
      'mobileai',
    ])
  })

  it('parses valid JSON and rejects invalid JSON', () => {
    expect(parseLast30DaysJson('{"topic":"mobile AI"}')).toEqual({ topic: 'mobile AI' })
    expect(() => parseLast30DaysJson('not json')).toThrow('last30days emitted invalid JSON')
  })

  it('preserves parent PATH when running with narrow env overrides', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'last30days-adapter-'))
    const fakeCli = join(tempDir, 'fake-last30days.js')

    writeFileSync(
      fakeCli,
      [
        "if (!process.env.PATH) {",
        "  console.error('PATH missing')",
        "  process.exit(42)",
        "}",
        "process.stdout.write(JSON.stringify({ topic: 'fake', argv: process.argv.slice(2) }))",
      ].join('\n'),
    )
    chmodSync(fakeCli, 0o755)

    try {
      const result = await runLast30Days({
        topic: {
          query: 'fake topic',
          mode: 'quick',
          lookbackDays: 7,
          sourceHints: {},
        },
        saveDir: '.data/radar/raw',
        env: {
          LAST30DAYS_CLI: fakeCli,
          LAST30DAYS_PYTHON: process.execPath,
        },
      })

      expect(result.report.topic).toBe('fake')
      expect(result.report.argv).toContain('fake topic')
      expect(result.command[0]).toBe(process.execPath)
      expect(result.command[1]).toBe(fakeCli)
    } finally {
      rmSync(dirname(fakeCli), { force: true, recursive: true })
    }
  })
})
