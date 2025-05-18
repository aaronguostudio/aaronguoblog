import { describe, it, expect } from 'vitest'
import { parseCustomDate, formatISODate, sortByDate } from '../utils/date'

describe('parseCustomDate', () => {
  it('parses ordinal date string', () => {
    const date = parseCustomDate('1st Jan 2023')
    expect(date.toISOString().split('T')[0]).toBe('2023-01-01')
  })
})

describe('formatISODate', () => {
  it('returns ISO formatted date', () => {
    const iso = formatISODate('February 5, 2024')
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('sortByDate', () => {
  it('sorts objects by date field ascending', () => {
    const items = [
      { date: '2023-02-01', value: 1 },
      { date: '2022-12-31', value: 2 },
      { date: '2023-01-15', value: 3 }
    ]
    const result = sortByDate(items, 'date', true)
    const dates = result.map(i => i.date)
    expect(dates).toEqual(['2022-12-31', '2023-01-15', '2023-02-01'])
  })
})
