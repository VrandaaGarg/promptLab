import { Link } from '@tanstack/react-router'
import { Crown, Scale } from 'lucide-react'
import { CategoryBadge } from '@/components/common/category-badge'
import { ModelLabel } from '@/components/common/model-badge'
import { RelativeTime } from '@/components/common/relative-time'
import { StrategyName } from '@/components/common/strategy-name'
import type { RunListItem } from '@/server/runs'
import { RatingValue } from '@/components/common/rating-value'

/** Stacked card layout of the history list for narrow screens. */
export function RunListCards({ runs }: { runs: RunListItem[] }) {
  return (
    <ul className="space-y-2">
      {runs.map((run) => (
        <li key={run.id}>
          <Link
            to="/runs/$runId"
            params={{ runId: run.id }}
            className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2/60"
          >
            <p className="line-clamp-2 text-sm font-medium">{run.task}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              <ModelLabel model={run.model} />
              <CategoryBadge category={run.category} />
              <span className="font-mono">{run.strategyCount} strategies</span>
              <RatingValue value={run.avgRating} />
              <RelativeTime date={run.createdAt} className="ml-auto" />
            </div>
            {(run.winner || run.judgeTop) && (
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-2.5 text-xs">
                {run.winner && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Crown aria-label="Your pick" className="size-3.5 text-muted-foreground" />
                    <StrategyName name={run.winner} />
                  </span>
                )}
                {run.judgeTop && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Scale aria-label="Judge's pick" className="size-3.5 text-muted-foreground" />
                    <StrategyName name={run.judgeTop} />
                  </span>
                )}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
