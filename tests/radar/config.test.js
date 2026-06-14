import { describe, expect, it } from 'vitest'
import {
  getDueRadarTopics,
  getRadarTopicBySlug,
  getRadarTopics,
  validateRadarTopic,
} from '../../scripts/radar/config.js'

describe('radar topic config', () => {
  it('contains the initial public topics', () => {
    const slugs = getRadarTopics().map(topic => topic.slug)

    expect(slugs).toEqual([
      'mobile-ai',
      'consumer-ai-apps',
      'ai-wearables',
      'coding-agents',
      'personal-ai-systems',
    ])
  })

  it('finds a topic by slug', () => {
    expect(getRadarTopicBySlug('mobile-ai')).toMatchObject({
      slug: 'mobile-ai',
      category: 'ai',
      cadence: 'daily',
      visibility: 'public',
    })
  })

  it('returns undefined for an unknown slug', () => {
    expect(getRadarTopicBySlug('unknown-topic')).toBeUndefined()
  })

  it('validates required fields with concrete errors', () => {
    const result = validateRadarTopic({
      slug: '',
      name: 'Broken',
      query: '',
      category: 'ai',
      cadence: 'hourly',
      mode: 'fast',
      lookbackDays: 0,
      visibility: 'public',
      minRelevance: 11,
    })

    expect(result).toEqual({
      ok: false,
      errors: [
        'slug must be a non-empty kebab-case string',
        'query must be a non-empty string',
        'cadence must be daily, weekly, or manual',
        'mode must be quick or deep',
        'lookbackDays must be an integer between 1 and 120',
        'minRelevance must be an integer between 1 and 10',
      ],
    })
  })

  it('selects due public daily topics', () => {
    const due = getDueRadarTopics({ cadence: 'daily' })

    expect(due.every(topic => topic.visibility === 'public')).toBe(true)
    expect(due.map(topic => topic.slug)).toContain('mobile-ai')
    expect(due.map(topic => topic.slug)).not.toContain('ai-wearables')
  })
})
