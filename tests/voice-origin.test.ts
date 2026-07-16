import { describe, expect, it } from 'vitest'

import { isAllowedVoiceOrigin } from '../server/utils/voice-origin'

describe('isAllowedVoiceOrigin', () => {
  it.each([
    'https://aaronguo.com',
    'https://www.aaronguo.com',
    'https://aaronguostudio.com',
    'https://www.aaronguostudio.com',
  ])('allows the production site origin %s', (origin) => {
    expect(isAllowedVoiceOrigin(origin, undefined)).toBe(true)
  })

  it('normalizes configured origins before comparing them', () => {
    expect(isAllowedVoiceOrigin('https://voice.example.com', ' https://voice.example.com/ ')).toBe(
      true,
    )
  })

  it('rejects malformed and lookalike origins', () => {
    expect(isAllowedVoiceOrigin('not-an-origin', undefined)).toBe(false)
    expect(isAllowedVoiceOrigin('https://aaronguostudio.com.example.com', undefined)).toBe(false)
  })
})
