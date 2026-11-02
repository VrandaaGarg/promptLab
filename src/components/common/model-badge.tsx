import { getModelLabel } from '@/lib/models'
import { cn } from '@/lib/utils'
import { ModelProviderIcon } from './provider-icon'

export function ModelBadge({ model, className }: { model: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      <ModelProviderIcon model={model} className="size-3" />
      {getModelLabel(model)}
    </span>
  )
}

/** Unboxed variant for dense rows such as tables. */
export function ModelLabel({ model, className }: { model: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <ModelProviderIcon model={model} className="size-3 text-muted-foreground" />
      {getModelLabel(model)}
    </span>
  )
}
