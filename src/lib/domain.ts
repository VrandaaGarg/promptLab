// Client-safe domain constants and types shared by the database schema, server and UI.

export const TASK_CATEGORIES = ['coding', 'writing', 'reasoning', 'factual', 'creative', 'other'] as const
export type TaskCategory = (typeof TASK_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  coding: 'Coding',
  writing: 'Writing',
  reasoning: 'Reasoning',
  factual: 'Factual',
  creative: 'Creative',
  other: 'Other',
}

export const RESPONSE_STATUSES = ['pending', 'streaming', 'done', 'error'] as const
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number]

export type Example = { input: string; output: string }

export type JudgeScore = {
  accuracy: number
  clarity: number
  completeness: number
  overall: number
  reason: string
}

/** Placeholders a strategy template may use. `{{task}}` is required. */
export const TEMPLATE_VARIABLES = {
  task: '{{task}}',
  examples: '{{examples}}',
  role: '{{role}}',
} as const

export const MAX_TASK_LENGTH = 4000
export const MAX_EXAMPLES = 5
export const MAX_STRATEGIES_PER_RUN = 8
/** Upper bound for a single rendered prompt (system + user), protecting cost and context size. */
export const MAX_PROMPT_CHARS = 24_000

export const isInFlight = (item: { status: ResponseStatus }) =>
  item.status === 'pending' || item.status === 'streaming'
