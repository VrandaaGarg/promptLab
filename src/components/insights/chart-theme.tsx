import type { ReactNode } from 'react'

/** Shared recharts styling, expressed with the app's CSS variables so it follows the theme. */
export const axisTick = { fill: 'var(--muted-foreground)', fontSize: 12 } as const
export const monoAxisTick = { ...axisTick, fontFamily: 'var(--font-mono)', fontSize: 11 } as const
export const gridStroke = 'var(--border)'
export const tooltipCursor = { fill: 'var(--surface-2)', opacity: 0.7 } as const

type ChartTooltipProps = {
  active?: boolean
  label?: ReactNode
  rows: Array<{ label: ReactNode; value: ReactNode; color?: string }>
}

/** Tooltip body used by every chart: surface background, hairline border, mono values. */
export function ChartTooltipBody({ active, label, rows }: ChartTooltipProps) {
  if (!active || rows.length === 0) return null
  return (
    <div className="min-w-36 rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground">
      {label !== undefined && <p className="mb-1.5 font-medium">{label}</p>}
      <ul className="space-y-1">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              {row.color && <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: row.color }} />}
              {row.label}
            </span>
            <span className="font-mono tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
