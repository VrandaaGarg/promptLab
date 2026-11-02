import { StrategyDot } from '@/components/common/strategy-visual'
import { Card } from '@/components/ui/card'
import { CATEGORY_LABELS, TASK_CATEGORIES } from '@/lib/domain'
import { formatScore } from '@/lib/format'
import type { Insights } from '@/server/insights'

const MAX_TINT = 42

/** Strategy × category matrix of average judge scores; tint strength follows the score. */
export function CategoryHeatTable({ insights }: { insights: Insights }) {
  const categories = TASK_CATEGORIES.filter((c) => insights.byCategory.some((b) => b.category === c && b.avgJudge !== null))
  const scoreOf = (strategy: string, category: string) =>
    insights.byCategory.find((b) => b.strategyKey === strategy && b.category === category)?.avgJudge ?? null

  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium">Strategy × category</h2>
      <p className="mt-1 text-xs text-muted-foreground">Average AI judge score (out of 10) by task category.</p>
      {categories.length === 0 ? (
        <div className="mt-5 flex h-32 items-center justify-center rounded-md bg-surface-2/60 text-sm text-muted-foreground">
          Categories appear once the AI judge has scored a run.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-44 px-2 py-1.5 text-left text-xs font-medium text-muted-foreground">
                  <span className="sr-only">Strategy</span>
                </th>
                {categories.map((c) => (
                  <th key={c} scope="col" className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
                    {CATEGORY_LABELS[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insights.perStrategy.map((s) => (
                <tr key={s.strategyKey}>
                  <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-normal">
                    <span className="inline-flex items-center gap-2">
                      <StrategyDot color={s.color} />
                      {s.strategyName}
                    </span>
                  </th>
                  {categories.map((c) => {
                    const score = scoreOf(s.strategyKey, c)
                    return (
                      <td
                        key={c}
                        className="h-10 rounded-md text-center font-mono text-xs tabular-nums"
                        style={{
                          backgroundColor:
                            score === null
                              ? 'var(--surface-2)'
                              : `color-mix(in srgb, var(--primary) ${Math.round((score / 10) * MAX_TINT)}%, transparent)`,
                        }}
                      >
                        {score === null ? <span className="text-muted-foreground">—</span> : formatScore(score)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
