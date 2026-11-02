import { Skeleton } from '@/components/ui/skeleton'

export function HistorySkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading history" className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-3 w-1/3" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-b-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  )
}
