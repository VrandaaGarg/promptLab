import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { strategyColor } from '@/components/common/strategy-visual'
import type { Insights } from '@/server/insights'
import { ChartCard } from './chart-card'
import { axisTick, ChartTooltipBody, gridStroke, monoAxisTick, tooltipCursor } from './chart-theme'

type StrategyStats = Insights['perStrategy'][number]

const ROW_HEIGHT = 36
const AXIS_HEIGHT = 28

export type StrategyMetricChartProps = {
  title: string
  description?: string
  strategies: StrategyStats[]
  metric: (s: StrategyStats) => number | null
  max: number
  format: (value: number) => string
  /** Axis tick labels; defaults to `format`. */
  axisFormat?: (value: number) => string
  /** Extra tooltip line, e.g. the sample size behind an average. */
  detail?: (s: StrategyStats) => string
  emptyMessage?: string
}

/** Horizontal bars comparing one metric across strategies, each in its strategy color. */
export function StrategyMetricChart({
  title,
  description,
  strategies,
  metric,
  max,
  format,
  axisFormat = format,
  detail,
  emptyMessage,
}: StrategyMetricChartProps) {
  const ticks = Array.from({ length: 6 }, (_, i) => (max * i) / 5)
  const data = strategies
    .map((s) => ({ name: s.strategyName, color: strategyColor(s.color), value: metric(s), source: s }))
    .filter((d): d is typeof d & { value: number } => d.value !== null)
    .sort((a, b) => b.value - a.value)
  const height = Math.max(data.length, 3) * ROW_HEIGHT + AXIS_HEIGHT

  return (
    <ChartCard title={title} description={description} height={height} empty={data.length === 0} emptyMessage={emptyMessage}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, max]}
            ticks={ticks}
            tickFormatter={axisFormat}
            tick={monoAxisTick}
            axisLine={false}
            tickLine={false}
            height={AXIS_HEIGHT}
          />
          <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={120} />
          <Tooltip
            cursor={tooltipCursor}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof data)[number] | undefined
              return (
                <ChartTooltipBody
                  active={active}
                  label={row?.name}
                  rows={
                    row
                      ? [
                          { label: title, value: format(row.value), color: row.color },
                          ...(detail ? [{ label: 'Based on', value: detail(row.source) }] : []),
                        ]
                      : []
                  }
                />
              )
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={500}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
