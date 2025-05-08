export function formatDate(date: string | null) {
  const isValid = !!date && /^\d{4}-\d{2}-\d{2}$/.test(date)

  if (!isValid) return ''

  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
