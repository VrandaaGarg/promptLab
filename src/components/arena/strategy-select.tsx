import { Link } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'
import { StrategyDot, StrategyIcon, strategyColor } from '@/components/common/strategy-visual'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { MAX_STRATEGIES_PER_RUN } from '@/lib/domain'
import { cn } from '@/lib/utils'
import type { Strategy } from '@/server/strategies'

const MAX_TRIGGER_DOTS = 5

export function StrategySelect({
  strategies,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  disabled,
}: {
  strategies: Strategy[]
  selected: ReadonlySet<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClear: () => void
  disabled?: boolean
}) {
  const chosen = strategies.filter((s) => selected.has(s.id))
  const atLimit = chosen.length >= MAX_STRATEGIES_PER_RUN
  const allSelected = chosen.length === Math.min(strategies.length, MAX_STRATEGIES_PER_RUN)

  const toOption = (strategy: Strategy) => ({
    value: strategy.id,
    disabled: atLimit && !selected.has(strategy.id),
    content: (
      <>
        <span className="flex items-center gap-2">
          <span style={{ color: strategyColor(strategy.color) }} className="inline-flex">
            <StrategyIcon icon={strategy.icon} className="size-3" />
          </span>
          <span className="truncate font-medium">{strategy.name}</span>
        </span>
        {strategy.description && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{strategy.description}</span>
        )}
      </>
    ),
  })

  const groups = [
    { label: 'Built-in', options: strategies.filter((s) => s.userId === null).map(toOption) },
    { label: 'Custom', options: strategies.filter((s) => s.userId !== null).map(toOption) },
  ].filter((g) => g.options.length > 0)

  const action = 'rounded text-xs font-medium transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

  return (
    <DropdownSelect
      label="Strategies"
      multiple
      groups={groups}
      isSelected={(id) => selected.has(id)}
      onSelect={(id) => onToggle(id)}
      disabled={disabled}
      className="w-[22rem]"
      trigger={
        <>
          {chosen.length > 0 && (
            <span aria-hidden="true" className="flex items-center pr-0.5">
              {chosen.slice(0, MAX_TRIGGER_DOTS).map((s) => (
                <StrategyDot key={s.id} color={s.color} className="size-2.5 border-[1.5px] border-surface not-first:-ml-1" />
              ))}
            </span>
          )}
          <span className="whitespace-nowrap">
            {chosen.length === 0 ? 'No strategies' : `${chosen.length} ${chosen.length === 1 ? 'strategy' : 'strategies'}`}
          </span>
        </>
      }
      header={
        <div className="flex items-center gap-3 border-b border-border px-3.5 py-2">
          <span className={cn('mr-auto text-xs', atLimit ? 'text-warning' : 'text-muted-foreground')}>
            {atLimit ? `Limit of ${MAX_STRATEGIES_PER_RUN} per run reached` : `${chosen.length} of up to ${MAX_STRATEGIES_PER_RUN}`}
          </span>
          <button type="button" onClick={onSelectAll} disabled={allSelected} className={cn(action, 'text-primary')}>
            Select all
          </button>
          <button type="button" onClick={onClear} disabled={chosen.length === 0} className={cn(action, 'text-muted-foreground')}>
            Clear
          </button>
        </div>
      }
      footer={
        <Link
          to="/strategies"
          className="flex items-center gap-2 border-t border-border px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Settings2 aria-hidden="true" className="size-3.5" />
          Manage strategies
        </Link>
      }
    />
  )
}
