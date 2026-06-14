import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseArgs } from '../../scripts/radar/cli.js'

const README_TEXT = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')
const RADAR_WORKFLOW_TEXT = readFileSync(new URL('../../.github/workflows/radar.yml', import.meta.url), 'utf8')
const PACKAGE_JSON = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

function argvForReadmeRadarRun(command) {
  const parts = command.trim().split(/\s+/)
  expect(parts.slice(0, 2)).toEqual(['pnpm', 'radar:run'])
  return ['node', 'cli.js', 'run', ...parts.slice(2)]
}

describe('parseArgs', () => {
  it('rejects unknown flags', () => {
    expect(() => parseArgs(['node', 'cli.js', 'run', '--wat'])).toThrow('Unknown flag: --wat')
  })

  it('requires topic values', () => {
    expect(() => parseArgs(['node', 'cli.js', 'run', '--topic'])).toThrow('--topic requires a value')
    expect(() => parseArgs(['node', 'cli.js', 'run', '--topic', '--dry-run'])).toThrow('--topic requires a value')
  })

  it('requires valid cadence values', () => {
    expect(() => parseArgs(['node', 'cli.js', 'run', '--cadence'])).toThrow('--cadence requires a value')
    expect(() => parseArgs(['node', 'cli.js', 'run', '--cadence', '--topic'])).toThrow('--cadence requires a value')
    expect(() => parseArgs(['node', 'cli.js', 'run', '--cadence', 'hourly'])).toThrow('--cadence must be daily, weekly, or manual')
  })

  it('parses valid run flags', () => {
    expect(parseArgs(['node', 'cli.js', 'run', '--topic', 'mobile-ai', '--dry-run', '--cadence', 'daily'])).toEqual({
      command: 'run',
      dryRun: true,
      topicSlug: 'mobile-ai',
      cadence: 'daily',
    })
  })

  it('parses export flags for static publishing', () => {
    expect(parseArgs(['node', 'cli.js', 'export', '--allow-local-ranking'])).toEqual({
      command: 'export',
      dryRun: false,
      topicSlug: undefined,
      cadence: undefined,
      allowLocalRanking: true,
    })
  })

  it('exposes a package script for static Radar export', () => {
    expect(PACKAGE_JSON.scripts['radar:export']).toBe('node scripts/radar/cli.js export')
  })

  it('parses README Radar run examples using the supported package-script shape', () => {
    const commands = README_TEXT.match(/^pnpm radar:run .+$/gm) || []

    expect(commands).toEqual(expect.arrayContaining([
      'pnpm radar:run --topic mobile-ai --dry-run',
      'pnpm radar:run --cadence daily',
      'pnpm radar:run --cadence weekly',
    ]))
    expect(commands.every(command => !command.includes(' -- --'))).toBe(true)

    expect(commands.map(command => parseArgs(argvForReadmeRadarRun(command)))).toEqual([
      {
        command: 'run',
        dryRun: true,
        topicSlug: 'mobile-ai',
        cadence: undefined,
      },
      {
        command: 'run',
        dryRun: false,
        topicSlug: undefined,
        cadence: 'daily',
      },
      {
        command: 'run',
        dryRun: false,
        topicSlug: undefined,
        cadence: 'daily',
      },
      {
        command: 'run',
        dryRun: false,
        topicSlug: undefined,
        cadence: 'weekly',
      },
    ])
  })

  it('keeps the Radar workflow on the supported package-script invocation shape', () => {
    expect(RADAR_WORKFLOW_TEXT).not.toContain('pnpm radar:run -- --')
    expect(RADAR_WORKFLOW_TEXT).toContain('pnpm radar:run --topic "$RADAR_TOPIC"')
    expect(RADAR_WORKFLOW_TEXT).toContain('pnpm radar:run --cadence daily')
    expect(RADAR_WORKFLOW_TEXT).toContain('pnpm radar:run --cadence weekly')
    expect(RADAR_WORKFLOW_TEXT).toContain('pnpm radar:run --cadence "$RADAR_CADENCE"')
  })
})
