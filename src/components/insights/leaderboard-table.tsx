import { StrategyDot } from '@/components/common/strategy-visual'
import { RatingValue } from '@/components/common/rating-value'
import { Card } from '@/components/ui/card'
import { formatCost, formatPercent, formatScore, formatTokens } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Insights } from '@/server/insights'

const HEADERS = ['#', 'Strategy', 'Avg judge', 'Avg rating', 'Win rate', 'Avg output tokens', 'Avg cost'] as const

export function LeaderboardTable({ strategies }: { strategies: Insights['perStrategy'] }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 pb-4">
        <h2 className="text-sm font-medium">Leaderboard</h2>
        <p className="mt-1 text-xs text-muted-foreground">Ranked by average AI judge score.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-y border-border bg-surface-2/50">
              {HEADERS.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-5 py-2.5 text-xs font-medium text-muted-foreground',
                    i < 2 ? 'text-left' : 'text-right',
                    i === 0 && 'w-12 pr-0',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strategies.map((s, i) => (
              <tr key={s.strategyKey} className="border-b border-border last:border-b-0">
                <td className="py-3 pl-5 font-mono text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                <th scope="row" className="whitespace-nowrap px-5 py-3 text-left font-medium">
                  <span className="inline-flex items-center gap-2">
                    <StrategyDot color={s.color} />
                    {s.strategyName}
                  </span>
                </th>
                <td className="px-5 py-3 text-right font-mono tabular-nums">
                  {formatScore(s.avgJudge)}
                  {s.avgJudge !== null && <span className="text-muted-foreground">/10</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <RatingValue value={s.avgRating} />
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">
                  {formatPercent(s.winRate)}
                  {s.contested > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {s.wins}/{s.contested}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">{formatTokens(s.avgOutputTokens)}</td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">{formatCost(s.avgCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
