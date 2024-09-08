export function formatUTCDate(dateString: string) {
  const date = new Date(dateString)
  return date.toUTCString() // Format as UTC string
}
