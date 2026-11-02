import { Skeleton } from '@/components/ui/skeleton'

export function RunViewSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading run">
      <div className="space-y-3">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border bg-surface p-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="mt-24 h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
