// Client-safe model catalog. IDs are OpenRouter model slugs.

export type ModelProvider = 'anthropic' | 'xai'

export type ModelOption = {
  id: string
  label: string
  provider: ModelProvider
  tier: 'Fast' | 'Balanced' | 'Flagship'
  description: string
}

export const MODELS = [
  {
    id: 'anthropic/claude-haiku-5.5',
    label: 'Claude Haiku 5.5',
    provider: 'anthropic',
    tier: 'Fast',
    description: 'Fastest and cheapest. Great default for side-by-side runs.',
  },
  {
    id: 'anthropic/claude-sonnet-5.5',
    label: 'Claude Sonnet 5.5',
    provider: 'anthropic',
    tier: 'Balanced',
    description: 'High quality reasoning and writing.',
  },
  {
    id: 'x-ai/grok-4.3',
    label: 'Grok 4.3',
    provider: 'xai',
    tier: 'Fast',
    description: 'Quick and inexpensive xAI model.',
  },
  {
    id: 'x-ai/grok-4.7',
    label: 'Grok 4.7',
    provider: 'xai',
    tier: 'Flagship',
    description: "xAI's most capable model.",
  },
] as const satisfies readonly ModelOption[]

export type ModelId = (typeof MODELS)[number]['id']

export const MODEL_IDS = MODELS.map((m) => m.id) as [ModelId, ...ModelId[]]

export const DEFAULT_MODEL: ModelId = 'anthropic/claude-haiku-5.5'

/** Fast model used for preparation work (generating examples and an expert role). */
export const PREP_MODEL: ModelId = 'anthropic/claude-haiku-5.5'

const PRIMARY_JUDGE: ModelId = 'anthropic/claude-sonnet-5.5'
const FALLBACK_JUDGE: ModelId = 'x-ai/grok-4.7'

/** The judge never grades its own output. */
export function pickJudgeModel(model: string): ModelId {
  return model === PRIMARY_JUDGE ? FALLBACK_JUDGE : PRIMARY_JUDGE
}

export function getModel(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id)
}

export function getModelLabel(id: string): string {
  return getModel(id)?.label ?? id
}
