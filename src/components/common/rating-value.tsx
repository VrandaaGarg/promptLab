import { Star } from 'lucide-react'
import { formatScore } from '@/lib/format'

/** Compact average rating: a single star and the value, or a dash. */
export function RatingValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1 font-mono tabular-nums" aria-label={`Average rating ${formatScore(value)} out of 5`}>
      <Star aria-hidden="true" className="size-3.5 fill-warning text-warning" />
      {formatScore(value)}
    </span>
  )
}
