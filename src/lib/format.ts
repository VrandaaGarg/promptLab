// Display formatting helpers. Pure and client-safe.

type DateInput = Date | string | number

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value))

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat('en-US')
const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export const EMPTY_VALUE = '—'

/** `$0.0004` for tiny amounts, `$1.27` otherwise; `—` when unknown. */
export function formatCost(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE
  if (value === 0) return '$0'
  if (value < 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(2)}`
}

/** `842`, `12.4K`, `1.2M`; `—` when unknown. */
export function formatTokens(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE
  return value < 10_000 ? integer.format(Math.round(value)) : compact.format(value)
}

export function formatNumber(value: number): string {
  return integer.format(value)
}

/** One decimal place, e.g. judge scores and average ratings. */
export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE
  return value.toFixed(1)
}

/** Ratio in 0..1 rendered as a whole percentage. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE
  return `${Math.round(value * 100)}%`
}

export function formatDate(value: DateInput): string {
  return dateTime.format(toDate(value))
}

export function formatShortDate(value: DateInput): string {
  return shortDate.format(toDate(value))
}

/** Compact relative time: `just now`, `5m ago`, `3h ago`, `2d ago`, then a short date. */
export function formatRelativeTime(value: DateInput, now: number = Date.now()): string {
  const seconds = Math.round((now - toDate(value).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatShortDate(value)
}
