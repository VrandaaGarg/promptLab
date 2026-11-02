import { useQuery } from '@tanstack/react-query'
import { strategiesQuery } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { StrategyDot } from './strategy-visual'

/**
 * A strategy referenced only by name (e.g. in run summaries). Resolves its color from the
 * strategy list when available, and falls back to a neutral dot for renamed or deleted ones.
 */
export function StrategyName({ name, className }: { name: string | null; className?: string }) {
  const { data } = useQuery(strategiesQuery())
  if (!name) return <span className="text-muted-foreground">—</span>
  const color = data?.find((s) => s.name === name)?.color
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      {color ? <StrategyDot color={color} /> : <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-border-strong" />}
      <span className="truncate">{name}</span>
    </span>
  )
}
