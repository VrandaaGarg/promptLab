import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMounted } from '@/hooks/use-mounted'
import { cn } from '@/lib/utils'

export type ChartCardProps = {
  title: string
  description?: string
  /** Fixed chart height in px; reserved during SSR so layout doesn't shift. */
  height: number
  empty?: boolean
  emptyMessage?: string
  className?: string
  children: ReactNode
}

/** Card frame for a chart. Charts measure the DOM, so they render on the client only. */
export function ChartCard({
  title,
  description,
  height,
  empty = false,
  emptyMessage = 'Not enough data yet.',
  className,
  children,
}: ChartCardProps) {
  const mounted = useMounted()
  return (
    <Card className={cn('p-5', className)}>
      <h2 className="text-sm font-medium">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-5" style={{ height }}>
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-md bg-surface-2/60 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : mounted ? (
          children
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    </Card>
  )
}
