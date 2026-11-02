import { ProviderIcon } from '@/components/common/provider-icon'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { CATEGORY_LABELS, TASK_CATEGORIES, type TaskCategory } from '@/lib/domain'
import { getModel, MODELS, PROVIDERS, type ModelId, type ModelOption } from '@/lib/models'
import { cn } from '@/lib/utils'

/** Sentinel option value for "no filter"; never reaches the URL. */
const ALL = '' as const

type FilterSelectProps<T> = { value: T | undefined; onChange: (value: T | undefined) => void; className?: string }

const categoryGroups = [
  {
    options: [
      { value: ALL, content: 'All categories' },
      ...TASK_CATEGORIES.map((category) => ({ value: category, content: CATEGORY_LABELS[category] })),
    ],
  },
]

const modelLabel = (model: ModelOption) => (
  <span className="flex min-w-0 items-center gap-2">
    <ProviderIcon provider={model.provider} className="size-3 text-muted-foreground" />
    <span className="truncate">{model.label}</span>
  </span>
)

const modelGroups = [
  { options: [{ value: ALL, content: 'All models' }] },
  ...PROVIDERS.map((provider) => ({
    label: provider.label,
    options: MODELS.filter((m) => m.provider === provider.id).map((model) => ({ value: model.id, content: modelLabel(model) })),
  })),
]

export function CategoryFilter({ value, onChange, className }: FilterSelectProps<TaskCategory>) {
  return (
    <DropdownSelect<TaskCategory | typeof ALL>
      variant="field"
      label="Filter by category"
      groups={categoryGroups}
      isSelected={(v) => v === (value ?? ALL)}
      onSelect={(v) => onChange(v || undefined)}
      className={cn('w-full sm:w-40', className)}
      trigger={<span className="truncate">{value ? CATEGORY_LABELS[value] : 'All categories'}</span>}
    />
  )
}

export function ModelFilter({ value, onChange, className }: FilterSelectProps<ModelId>) {
  const model = value && getModel(value)
  return (
    <DropdownSelect<ModelId | typeof ALL>
      variant="field"
      label="Filter by model"
      groups={modelGroups}
      isSelected={(v) => v === (value ?? ALL)}
      onSelect={(v) => onChange(v || undefined)}
      className={cn('w-full sm:w-48', className)}
      trigger={model ? modelLabel(model) : <span className="truncate">All models</span>}
    />
  )
}
