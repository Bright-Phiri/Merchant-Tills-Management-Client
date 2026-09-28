export function money(amount, currency = 'MWK') {
  return `${currency === 'MWK' ? 'MK' : currency} ${new Intl.NumberFormat('en-MW', {
    minimumFractionDigits: Number(amount) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(Number(amount))}`
}
export function dateLabel(value, includeTime = false) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Africa/Blantyre',
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value))
}
export function renewalEnd(overview, days) {
  if (!overview?.current_date || !days) return null
  const today = overview.current_date
  const previous = overview.subscription?.end_date
  const continuing = previous && previous >= today
  const date = new Date(`${continuing ? previous : today}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + Number(days) - (continuing ? 0 : 1))
  return date.toISOString().slice(0, 10)
}
export function safePortalReturn(value) {
  return typeof value === 'string' &&
    /^\/portal(?:\/|\?|$)/.test(value) &&
    !value.startsWith('/portal/login') &&
    !/[\\\r\n]/.test(value)
    ? value
    : '/portal/plans'
}
export function billingError(error) {
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.response?.status === 503 || error.code === 'ECONNABORTED')
    return 'We could not confirm the payment request. Check its status before starting another payment.'
  if (!error.response) return 'We could not connect. Check your internet connection and try again.'
  return (
    error.response.data?.message ||
    error.response.data?.error ||
    'Something went wrong. Please try again.'
  )
}
export function trustedCheckout(url) {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'checkout.paychangu.com' &&
      !parsed.username &&
      !parsed.password
    )
  } catch {
    return false
  }
}
