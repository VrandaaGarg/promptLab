// Client-safe Zod schemas shared by forms and server functions.

import { z } from 'zod'
import { MAX_EXAMPLES, TEMPLATE_VARIABLES } from './domain'
import { STRATEGY_COLORS, STRATEGY_ICONS } from './strategies'

export const strategyInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(40, 'Name is too long'),
  description: z.string().trim().max(200, 'Keep the description under 200 characters'),
  systemPrompt: z.string().trim().max(4000, 'System prompt is too long'),
  template: z
    .string()
    .trim()
    .min(1, 'Template is required')
    .max(8000, 'Template is too long')
    .refine((t) => t.includes(TEMPLATE_VARIABLES.task), `Template must include ${TEMPLATE_VARIABLES.task}`),
  exampleCount: z.number().int().min(0).max(MAX_EXAMPLES),
  color: z.enum(STRATEGY_COLORS),
  icon: z.enum(STRATEGY_ICONS),
})

export type StrategyInput = z.infer<typeof strategyInputSchema>
