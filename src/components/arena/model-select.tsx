import { ProviderIcon } from '@/components/common/provider-icon'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { getModel, MODELS, PROVIDERS, type ModelId } from '@/lib/models'

const groups = PROVIDERS.map((provider) => ({
  label: provider.label,
  options: MODELS.filter((m) => m.provider === provider.id).map((model) => ({
    value: model.id,
    content: (
      <>
        <span className="flex items-center gap-2">
          <ProviderIcon provider={model.provider} className="size-3 text-muted-foreground" />
          <span className="truncate font-medium">{model.label}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{model.tier}</span>
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{model.description}</span>
      </>
    ),
  })),
}))

export function ModelSelect({
  value,
  onChange,
  disabled,
}: {
  value: ModelId
  onChange: (model: ModelId) => void
  disabled?: boolean
}) {
  const model = getModel(value)
  return (
    <DropdownSelect
      label="Model"
      groups={groups}
      isSelected={(id) => id === value}
      onSelect={onChange}
      disabled={disabled}
      className="w-[22rem]"
      trigger={
        <>
          {model && <ProviderIcon provider={model.provider} className="size-3" />}
          <span className="truncate">{model?.label ?? value}</span>
        </>
      }
    />
  )
}
