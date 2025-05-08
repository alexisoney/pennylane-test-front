import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('returns an empty string for null input', () => {
    expect(formatCurrency(null)).toBe('')
  })

  it('returns empty string for invalid input', () => {
    expect(formatCurrency('not a number')).toBe('')
  })

  it('formats integer as currency string', () => {
    expect(formatCurrency('123')).toBe('$123')
  })

  it('formats float with one decimal as currency string', () => {
    expect(formatCurrency('123.4')).toBe('$123.40')
  })

  it('rounds down float correctly', () => {
    expect(formatCurrency('123.454')).toBe('$123.45')
  })

  it('rounds up float correctly', () => {
    expect(formatCurrency('123.455')).toBe('$123.46')
  })

  it('formats number with thousand separator', () => {
    expect(formatCurrency('20000')).toBe('$20,000')
  })
})
