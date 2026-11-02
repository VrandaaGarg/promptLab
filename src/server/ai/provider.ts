import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { ProviderMetadata } from 'ai'
import { env } from '@/env'

let provider: ReturnType<typeof createOpenRouter> | undefined

export function languageModel(modelId: string) {
  provider ??= createOpenRouter({ apiKey: env().OPENROUTER_API_KEY, appName: 'PromptLab' })
  return provider(modelId)
}

/** Reads the USD cost OpenRouter reports for a call. Missing data means unknown, not zero. */
export function readCost(metadata: ProviderMetadata | undefined): number | null {
  const usage = metadata?.openrouter?.usage
  if (usage && typeof usage === 'object' && 'cost' in usage && typeof usage.cost === 'number') {
    return usage.cost
  }
  return null
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return typeof error === 'string' ? error : 'Unknown error'
}
