import { formatDate } from './date'

describe('formatDate', () => {
  it('returns an empty string for invalid date input', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('123')).toBe('')
  })

  it('formats a valid date string into readable format', () => {
    expect(formatDate('2021-02-03')).toBe('Feb 03, 2021')
  })
})
