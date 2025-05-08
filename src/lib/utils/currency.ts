export function formatCurrency(string: string | null) {
  if (string === null) return ''

  const number = parseFloat(string)

  if (isNaN(number)) return ''

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
    .format(number)
    .replace(/\.00$/, '')
}
