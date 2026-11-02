import { Select } from '@/components/ui/select'
import { CATEGORY_LABELS, TASK_CATEGORIES, type TaskCategory } from '@/lib/domain'
import { MODELS, type ModelId } from '@/lib/models'
import { cn } from '@/lib/utils'

const isCategory = (value: string): value is TaskCategory => (TASK_CATEGORIES as readonly string[]).includes(value)
const isModel = (value: string): value is ModelId => MODELS.some((m) => m.id === value)

type FilterSelectProps<T> = { value: T | undefined; onChange: (value: T | undefined) => void; className?: string }

export function CategoryFilter({ value, onChange, className }: FilterSelectProps<TaskCategory>) {
  return (
    <Select
      aria-label="Filter by category"
      value={value ?? ''}
      onChange={(e) => onChange(isCategory(e.target.value) ? e.target.value : undefined)}
      className={cn('w-full sm:w-40', className)}
    >
      <option value="">All categories</option>
      {TASK_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {CATEGORY_LABELS[category]}
        </option>
      ))}
    </Select>
  )
}

export function ModelFilter({ value, onChange, className }: FilterSelectProps<ModelId>) {
  return (
    <Select
      aria-label="Filter by model"
      value={value ?? ''}
      onChange={(e) => onChange(isModel(e.target.value) ? e.target.value : undefined)}
      className={cn('w-full sm:w-48', className)}
    >
      <option value="">All models</option>
      {MODELS.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </Select>
  )
}
