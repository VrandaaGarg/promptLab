import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChartColumn } from 'lucide-react'
import { z } from 'zod'
import { CategoryFilter, ModelFilter } from '@/components/common/filter-selects'
import { CategoryHeatTable } from '@/components/insights/category-heat-table'
import { InsightsSkeleton } from '@/components/insights/insights-skeleton'
import { InsightsStats } from '@/components/insights/insights-stats'
import { LeaderboardTable } from '@/components/insights/leaderboard-table'
import { RunsTimelineChart } from '@/components/insights/runs-timeline-chart'
import { StrategyMetricChart } from '@/components/insights/strategy-metric-chart'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { TASK_CATEGORIES } from '@/lib/domain'
import { formatPercent, formatScore } from '@/lib/format'
import { MODEL_IDS } from '@/lib/models'
import { insightsQuery } from '@/lib/queries'
import { cn } from '@/lib/utils'

const insightsSearchSchema = z.object({
  model: z.enum(MODEL_IDS).optional().catch(undefined),
  category: z.enum(TASK_CATEGORIES).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/insights')({
  validateSearch: insightsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => queryClient.ensureQueryData(insightsQuery(deps)),
  head: () => ({ meta: [{ title: 'Insights — PromptLab' }] }),
  pendingComponent: InsightsSkeleton,
  component: InsightsPage,
})

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function InsightsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isFetching, isPlaceholderData } = useQuery(insightsQuery(search))
  const filtered = Boolean(search.model || search.category)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Which strategies work best, by your ratings and the AI judge."
        actions={
          <>
            <ModelFilter
              value={search.model}
              onChange={(model) => void navigate({ search: (prev) => ({ ...prev, model }), replace: true })}
            />
            <CategoryFilter
              value={search.category}
              onChange={(category) => void navigate({ search: (prev) => ({ ...prev, category }), replace: true })}
            />
          </>
        }
      />

      {!data ? (
        <InsightsSkeleton />
      ) : data.totals.runs === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong">
          <EmptyState
            icon={<ChartColumn className="size-5" />}
            title={filtered ? 'No runs match these filters' : 'Run a few experiments to see insights'}
            description={
              filtered
                ? 'Try another model or category.'
                : 'Each run adds judge scores, ratings and costs here, so patterns emerge over time.'
            }
            action={
              filtered ? (
                <Link to="/insights" className={buttonVariants({ variant: 'outline' })}>
                  Clear filters
                </Link>
              ) : (
                <Link to="/arena" className={buttonVariants()}>
                  Open the arena
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className={cn('space-y-4 transition-opacity', isFetching && isPlaceholderData && 'opacity-60')}>
          <InsightsStats totals={data.totals} />
          <div className="grid gap-4 lg:grid-cols-2">
            <StrategyMetricChart
              title="Avg judge score"
              description="AI judge's overall score, out of 10."
              strategies={data.perStrategy}
              metric={(s) => s.avgJudge}
              max={10}
              format={formatScore}
              axisFormat={String}
              emptyMessage="No judged responses yet."
            />
            <StrategyMetricChart
              title="Avg rating"
              description="Your star ratings, out of 5."
              strategies={data.perStrategy}
              metric={(s) => s.avgRating}
              max={5}
              format={formatScore}
              axisFormat={String}
              detail={(s) => plural(s.rated, 'rating')}
              emptyMessage="Rate some responses to see this."
            />
            <StrategyMetricChart
              title="Win rate"
              description="How often you marked it best, in runs where you picked one."
              strategies={data.perStrategy}
              metric={(s) => s.winRate}
              max={1}
              format={formatPercent}
              detail={(s) => `${s.wins} of ${plural(s.contested, 'run')}`}
              emptyMessage="Mark a best response to see win rates."
            />
            <RunsTimelineChart timeline={data.timeline} />
          </div>
          <CategoryHeatTable insights={data} />
          <LeaderboardTable strategies={data.perStrategy} />
        </div>
      )}
    </div>
  )
}
