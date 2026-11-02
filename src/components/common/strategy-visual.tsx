import {
  Brain,
  Compass,
  FlaskConical,
  Layers,
  ListChecks,
  PenLine,
  Sparkles,
  Target,
  UserRound,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { STRATEGY_COLORS, type StrategyColor, type StrategyIcon as StrategyIconKey } from '@/lib/strategies'
import { cn } from '@/lib/utils'

export const STRATEGY_ICON_COMPONENTS: Record<StrategyIconKey, LucideIcon> = {
  zap: Zap,
  target: Target,
  layers: Layers,
  brain: Brain,
  'user-round': UserRound,
  sparkles: Sparkles,
  flask: FlaskConical,
  compass: Compass,
  'pen-line': PenLine,
  'list-checks': ListChecks,
}

export const STRATEGY_ICON_LABELS: Record<StrategyIconKey, string> = {
  zap: 'Lightning',
  target: 'Target',
  layers: 'Layers',
  brain: 'Brain',
  'user-round': 'Person',
  sparkles: 'Sparkles',
  flask: 'Flask',
  compass: 'Compass',
  'pen-line': 'Pen',
  'list-checks': 'Checklist',
}

const isColor = (value: string): value is StrategyColor => (STRATEGY_COLORS as readonly string[]).includes(value)
const isIcon = (value: string): value is StrategyIconKey => value in STRATEGY_ICON_COMPONENTS

/** CSS color for a strategy color token, e.g. `strategy-3` → `var(--strategy-3)`. */
export function strategyColor(token: string): string {
  return `var(--${isColor(token) ? token : 'strategy-1'})`
}

export function StrategyIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = STRATEGY_ICON_COMPONENTS[isIcon(icon) ? icon : 'sparkles']
  return <Icon aria-hidden="true" className={cn('size-3.5 shrink-0', className)} />
}

export function StrategyDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: strategyColor(color) }}
    />
  )
}

/** Dot + icon + name, the canonical inline representation of a strategy. */
export function StrategyLabel({
  name,
  color,
  icon,
  className,
}: {
  name: string
  color: string
  icon?: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <StrategyDot color={color} />
      {icon && (
        <span style={{ color: strategyColor(color) }} className="inline-flex">
          <StrategyIcon icon={icon} />
        </span>
      )}
      <span className="truncate">{name}</span>
    </span>
  )
}
