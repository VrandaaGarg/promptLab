// Client-safe strategy metadata and prompt rendering.

import { TEMPLATE_VARIABLES, type Example } from './domain'

export const STRATEGY_COLORS = ['strategy-1', 'strategy-2', 'strategy-3', 'strategy-4', 'strategy-5'] as const
export type StrategyColor = (typeof STRATEGY_COLORS)[number]

export const STRATEGY_ICONS = [
  'zap',
  'target',
  'layers',
  'brain',
  'user-round',
  'sparkles',
  'flask',
  'compass',
  'pen-line',
  'list-checks',
] as const
export type StrategyIcon = (typeof STRATEGY_ICONS)[number]

export type BuiltInStrategy = {
  slug: string
  name: string
  description: string
  systemPrompt: string | null
  template: string
  exampleCount: number
  color: StrategyColor
  icon: StrategyIcon
}

const EXAMPLE_PREAMBLE = `Here is how similar tasks have been answered:\n\n${TEMPLATE_VARIABLES.examples}\n\nNow complete the following task in the same spirit:\n\n${TEMPLATE_VARIABLES.task}`

export const BUILT_IN_STRATEGIES: BuiltInStrategy[] = [
  {
    slug: 'zero-shot',
    name: 'Zero-shot',
    description: 'The task on its own, with no examples or extra guidance.',
    systemPrompt: null,
    template: TEMPLATE_VARIABLES.task,
    exampleCount: 0,
    color: 'strategy-1',
    icon: 'zap',
  },
  {
    slug: 'one-shot',
    name: 'One-shot',
    description: 'The task preceded by a single worked example.',
    systemPrompt: null,
    template: EXAMPLE_PREAMBLE,
    exampleCount: 1,
    color: 'strategy-2',
    icon: 'target',
  },
  {
    slug: 'few-shot',
    name: 'Few-shot',
    description: 'The task preceded by three worked examples.',
    systemPrompt: null,
    template: EXAMPLE_PREAMBLE,
    exampleCount: 3,
    color: 'strategy-3',
    icon: 'layers',
  },
  {
    slug: 'chain-of-thought',
    name: 'Chain-of-Thought',
    description: 'Asks the model to reason step by step before answering.',
    systemPrompt: null,
    template: `${TEMPLATE_VARIABLES.task}\n\nThink through this step by step. Lay out your reasoning clearly, then give the final result under a heading named "Answer".`,
    exampleCount: 0,
    color: 'strategy-4',
    icon: 'brain',
  },
  {
    slug: 'role-based',
    name: 'Role-based',
    description: 'Gives the model an expert persona tailored to the task.',
    systemPrompt: `You are ${TEMPLATE_VARIABLES.role}. Answer with the precision, judgment and practical insight of a leading professional in that field.`,
    template: TEMPLATE_VARIABLES.task,
    exampleCount: 0,
    color: 'strategy-5',
    icon: 'user-round',
  },
]

export const DEFAULT_ROLE = 'a seasoned domain expert with deep, practical experience in the subject of the task'

type RenderContext = { task: string; examples: Example[]; role: string }

function formatExamples(examples: Example[]): string {
  return examples
    .map((e, i) => `Example ${i + 1}\nInput: ${e.input}\nOutput: ${e.output}`)
    .join('\n\n')
}

function fill(text: string, ctx: RenderContext, exampleCount: number): string {
  return text
    .replaceAll(TEMPLATE_VARIABLES.examples, formatExamples(ctx.examples.slice(0, exampleCount)))
    .replaceAll(TEMPLATE_VARIABLES.role, ctx.role)
    .replaceAll(TEMPLATE_VARIABLES.task, ctx.task)
}

/** Builds the exact system and user prompt that will be sent for a strategy. */
export function renderStrategyPrompt(
  strategy: Pick<BuiltInStrategy, 'systemPrompt' | 'template' | 'exampleCount'>,
  ctx: RenderContext,
): { systemPrompt: string | null; userPrompt: string } {
  const systemPrompt = strategy.systemPrompt?.trim()
    ? fill(strategy.systemPrompt, ctx, strategy.exampleCount)
    : null
  return { systemPrompt, userPrompt: fill(strategy.template, ctx, strategy.exampleCount) }
}

export function strategyUsesRole(strategy: Pick<BuiltInStrategy, 'systemPrompt' | 'template'>): boolean {
  return [strategy.systemPrompt ?? '', strategy.template].some((t) => t.includes(TEMPLATE_VARIABLES.role))
}
