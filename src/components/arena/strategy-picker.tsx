import { StrategyIcon, strategyColor } from '@/components/common/strategy-visual'
import { ToggleChip } from '@/components/ui/toggle-chip'
import { MAX_STRATEGIES_PER_RUN } from '@/lib/domain'
import type { Strategy } from '@/server/strategies'

export function StrategyPicker({
  strategies,
  selected,
  onToggle,
  disabled,
}: {
  strategies: Strategy[]
  selected: ReadonlySet<string>
  onToggle: (id: string, pressed: boolean) => void
  disabled?: boolean
}) {
  const atLimit = strategies.filter((s) => selected.has(s.id)).length >= MAX_STRATEGIES_PER_RUN
  return (
    <div role="group" aria-label="Strategies" className="flex flex-wrap gap-2">
      {strategies.map((strategy) => {
        const pressed = selected.has(strategy.id)
        const blocked = atLimit && !pressed
        return (
          <ToggleChip
            key={strategy.id}
            pressed={pressed}
            onPressedChange={(next) => onToggle(strategy.id, next)}
            disabled={disabled || blocked}
            dotColor={strategyColor(strategy.color)}
            icon={<StrategyIcon icon={strategy.icon} />}
            title={blocked ? `Up to ${MAX_STRATEGIES_PER_RUN} strategies per run` : strategy.description || undefined}
          >
            {strategy.name}
          </ToggleChip>
        )
      })}
    </div>
  )
}
