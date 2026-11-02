import { useId } from 'react'
import { ProviderIcon } from '@/components/common/provider-icon'
import { MODELS, type ModelId } from '@/lib/models'
import { cn } from '@/lib/utils'

export function ModelPicker({
  value,
  onChange,
  disabled,
}: {
  value: ModelId
  onChange: (model: ModelId) => void
  disabled?: boolean
}) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label="Model" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {MODELS.map((model) => {
        const selected = model.id === value
        return (
          <label
            key={model.id}
            title={model.description}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md border px-2.5 py-2.5 transition-colors sm:px-3',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              selected ? 'border-primary bg-accent' : 'border-border bg-surface hover:bg-surface-2',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="radio"
              name={name}
              value={model.id}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(model.id)}
              className="sr-only"
            />
            <span
              className={cn(
                'hidden size-7 shrink-0 items-center justify-center rounded-md sm:flex',
                selected ? 'bg-surface text-primary' : 'bg-surface-2 text-muted-foreground',
              )}
            >
              <ProviderIcon provider={model.provider} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{model.label}</span>
              <span className={cn('flex items-center gap-1 text-[11px]', selected ? 'text-primary' : 'text-muted-foreground')}>
                <ProviderIcon provider={model.provider} className="size-2.5 sm:hidden" />
                {model.tier}
              </span>
              <span className="sr-only">. {model.description}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
