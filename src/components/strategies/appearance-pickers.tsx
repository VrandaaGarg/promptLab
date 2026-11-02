import { Check } from 'lucide-react'
import { useId } from 'react'
import { STRATEGY_ICON_COMPONENTS, STRATEGY_ICON_LABELS, strategyColor } from '@/components/common/strategy-visual'
import { STRATEGY_COLORS, STRATEGY_ICONS, type StrategyColor, type StrategyIcon } from '@/lib/strategies'
import { cn } from '@/lib/utils'

const optionRing = 'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring'

export function ColorPicker({ value, onChange }: { value: StrategyColor; onChange: (color: StrategyColor) => void }) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2">
      {STRATEGY_COLORS.map((color, i) => {
        const selected = value === color
        return (
          <label
            key={color}
            className={cn(
              'flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-colors',
              selected ? 'border-foreground' : 'border-transparent hover:border-border-strong',
              optionRing,
            )}
          >
            <input
              type="radio"
              name={name}
              value={color}
              checked={selected}
              onChange={() => onChange(color)}
              className="sr-only"
              aria-label={`Color ${i + 1}`}
            />
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full text-background"
              style={{ backgroundColor: strategyColor(color) }}
            >
              {selected && <Check className="size-3.5" strokeWidth={3} />}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export function IconPicker({
  value,
  color,
  onChange,
}: {
  value: StrategyIcon
  color: StrategyColor
  onChange: (icon: StrategyIcon) => void
}) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap">
      {STRATEGY_ICONS.map((icon) => {
        const Icon = STRATEGY_ICON_COMPONENTS[icon]
        const selected = value === icon
        return (
          <label
            key={icon}
            title={STRATEGY_ICON_LABELS[icon]}
            className={cn(
              'flex size-9 cursor-pointer items-center justify-center rounded-md border transition-colors',
              selected ? 'border-border-strong bg-surface-2' : 'border-transparent text-muted-foreground hover:bg-surface-2',
              optionRing,
            )}
            style={selected ? { color: strategyColor(color) } : undefined}
          >
            <input
              type="radio"
              name={name}
              value={icon}
              checked={selected}
              onChange={() => onChange(icon)}
              className="sr-only"
              aria-label={STRATEGY_ICON_LABELS[icon]}
            />
            <Icon aria-hidden="true" className="size-4" />
          </label>
        )
      })}
    </div>
  )
}
