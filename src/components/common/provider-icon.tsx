import { SiDeepseek, SiMoonshotai, SiQwen } from 'react-icons/si'
import { getModel, type ModelProvider } from '@/lib/models'
import { cn } from '@/lib/utils'

const icons = { deepseek: SiDeepseek, qwen: SiQwen, moonshot: SiMoonshotai } as const

export function ProviderIcon({ provider, className }: { provider: ModelProvider; className?: string }) {
  const Icon = icons[provider]
  return <Icon aria-hidden="true" className={cn('size-3.5 shrink-0', className)} />
}

/** Provider icon for a model id, or nothing if the model is unknown. */
export function ModelProviderIcon({ model, className }: { model: string; className?: string }) {
  const provider = getModel(model)?.provider
  return provider ? <ProviderIcon provider={provider} className={className} /> : null
}
