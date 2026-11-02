// Client-safe model catalog. IDs are OpenRouter model slugs.

export const PROVIDERS = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'qwen', label: 'Qwen' },
  { id: 'moonshot', label: 'Moonshot AI' },
] as const

export type ModelProvider = (typeof PROVIDERS)[number]['id']

export type ModelOption = {
  id: string
  label: string
  provider: ModelProvider
  tier: 'Fast' | 'Balanced' | 'Flagship'
  description: string
}

export const MODELS = [
  {
    id: 'deepseek/deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    tier: 'Fast',
    description: 'Very fast and inexpensive. Great default for side-by-side runs.',
  },
  {
    id: 'deepseek/deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    provider: 'deepseek',
    tier: 'Balanced',
    description: 'Stronger reasoning and writing from DeepSeek.',
  },
  {
    id: 'qwen/qwen3.8-flash',
    label: 'Qwen 3.8 Flash',
    provider: 'qwen',
    tier: 'Fast',
    description: 'Quick, low-cost model from Alibaba Qwen.',
  },
  {
    id: 'qwen/qwen3.8-max-0902',
    label: 'Qwen 3.8 Max',
    provider: 'qwen',
    tier: 'Flagship',
    description: "Qwen's most capable model.",
  },
  {
    id: 'moonshotai/kimi-k3',
    label: 'Kimi K3',
    provider: 'moonshot',
    tier: 'Flagship',
    description: "Moonshot AI's flagship model, strong at long-form reasoning.",
  },
] as const satisfies readonly ModelOption[]

export type ModelId = (typeof MODELS)[number]['id']

export const MODEL_IDS = MODELS.map((m) => m.id) as [ModelId, ...ModelId[]]

export const DEFAULT_MODEL: ModelId = 'deepseek/deepseek-v4-flash'

/** Fast model used for preparation work (generating examples and an expert role). */
export const PREP_MODEL: ModelId = 'deepseek/deepseek-v4-flash'

const PRIMARY_JUDGE: ModelId = 'qwen/qwen3.8-max-0902'
const FALLBACK_JUDGE: ModelId = 'deepseek/deepseek-v4-pro'

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
