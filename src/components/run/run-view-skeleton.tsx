import { Skeleton } from '@/components/ui/skeleton'

export function RunViewSkeleton({ tabs = 5 }: { tabs?: number }) {
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
      <div className="space-y-4">
        <div className="flex gap-4 overflow-hidden border-b border-border pb-3 pt-2">
          {Array.from({ length: tabs }, (_, i) => (
            <Skeleton key={i} className="h-5 w-28 shrink-0" />
          ))}
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-48" />
            </div>
            <div className="max-w-[75ch] space-y-3 px-6 py-5">
              {['w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3'].map((w, i) => (
                <Skeleton key={i} className={`h-3.5 ${w}`} />
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-border bg-surface p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-6 h-3 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
