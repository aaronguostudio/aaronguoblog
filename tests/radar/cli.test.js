import { describe, expect, it } from 'vitest'
import { parseArgs } from '../../scripts/radar/cli.js'

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
})
