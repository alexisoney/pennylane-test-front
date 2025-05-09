export function formatDate(date: string | null) {
  const isValid = !!date && /^\d{4}-\d{2}-\d{2}$/.test(date)

  if (!isValid) return ''

  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function to_YYYY_MM_DD(date?: Date) {
  if (date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return [year, month, day].join('-')
  }

  return ''
}
