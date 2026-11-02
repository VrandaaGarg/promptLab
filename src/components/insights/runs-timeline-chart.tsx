import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDayKey } from '@/lib/format'
import type { Insights } from '@/server/insights'
import { ChartCard } from './chart-card'
import { ChartTooltipBody, gridStroke, monoAxisTick } from './chart-theme'

export function RunsTimelineChart({ timeline }: { timeline: Insights['timeline'] }) {
  const data = timeline.map((t) => ({ ...t, label: formatDayKey(t.day) }))
  const empty = data.every((d) => d.runs === 0)

  return (
    <ChartCard
      title="Runs per day"
      description="Last 30 days"
      height={220}
      empty={empty}
      emptyMessage="No runs in the last 30 days."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 20, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={monoAxisTick} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis allowDecimals={false} tick={monoAxisTick} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            cursor={{ stroke: 'var(--border-strong)' }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof data)[number] | undefined
              return (
                <ChartTooltipBody
                  active={active}
                  label={row?.label}
                  rows={row ? [{ label: 'Runs', value: row.runs, color: 'var(--primary)' }] : []}
                />
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="runs"
            stroke="var(--primary)"
            strokeWidth={1.75}
            fill="var(--primary)"
            fillOpacity={0.1}
            activeDot={{ r: 3.5, fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 2 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
