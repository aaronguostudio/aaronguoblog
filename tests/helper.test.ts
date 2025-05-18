import { describe, it, expect } from 'vitest'
import { makeFirstCharUpper } from '../utils/helper'

describe('makeFirstCharUpper', () => {
  it('returns empty string unchanged', () => {
    expect(makeFirstCharUpper('')).toBe('')
  })

  it('capitalizes the first character of a word', () => {
    expect(makeFirstCharUpper('hello')).toBe('Hello')
  })

  it('handles a single character string', () => {
    expect(makeFirstCharUpper('a')).toBe('A')
  })
})
