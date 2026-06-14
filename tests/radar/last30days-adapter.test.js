import { describe, expect, it } from 'vitest'
import {
  buildLast30DaysArgs,
  parseLast30DaysJson,
  resolveLast30DaysCli,
  resolvePythonCommand,
} from '../../scripts/radar/last30days-adapter.js'

describe('last30days adapter', () => {
  it('resolves explicit CLI path first', () => {
    expect(resolveLast30DaysCli({ LAST30DAYS_CLI: '/tmp/last30days.py' })).toBe('/tmp/last30days.py')
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
})
