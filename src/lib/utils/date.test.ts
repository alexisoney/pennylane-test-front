import { formatDate, to_YYYY_MM_DD } from './date'

describe('formatDate', () => {
  it('returns an empty string for invalid date input', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('123')).toBe('')
  })

  it('formats a valid date string into readable format', () => {
    expect(formatDate('2021-02-03')).toBe('Feb 03, 2021')
  })
})

describe('to_YYYY_MM_DD', () => {
  it('returns an empty sring for invalid date input', () => {
    expect(to_YYYY_MM_DD()).toBe('')
  })

  it('formats a valid date into date string', () => {
    expect(to_YYYY_MM_DD(new Date('2025-06-08'))).toBe('2025-06-08')
  })
})
