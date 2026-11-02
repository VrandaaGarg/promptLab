import { formatDate, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Relative timestamp with the full date on hover. Server and client clocks differ, so hydration text may too. */
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const iso = (date instanceof Date ? date : new Date(date)).toISOString()
  return (
    <time dateTime={iso} title={formatDate(date)} suppressHydrationWarning className={cn('whitespace-nowrap', className)}>
      {formatRelativeTime(date)}
    </time>
  )
}
