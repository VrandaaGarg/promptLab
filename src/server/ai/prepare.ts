import { generateText, Output } from 'ai'
import { z } from 'zod'
import { DEFAULT_ROLE } from '@/lib/strategies'
import type { Example } from '@/lib/domain'
import { PREP_MODEL } from '@/lib/models'
import { languageModel } from './provider'

type PrepareInput = { task: string; exampleCount: number; needsRole: boolean }
type PrepareResult = { examples: Example[]; role: string }

/**
 * Generates worked examples (for one/few-shot) and an expert persona (for role-based)
 * in a single fast call. Falls back gracefully so a run never fails at this step.
 */
export async function prepareRunContext({ task, exampleCount, needsRole }: PrepareInput): Promise<PrepareResult> {
  if (exampleCount === 0 && !needsRole) return { examples: [], role: DEFAULT_ROLE }

  const schema = z.object({
    examples: z
      .array(z.object({ input: z.string(), output: z.string() }))
      .describe('Worked examples of tasks similar to (but different from) the user task, with ideal answers'),
    role: z.string().describe('A short expert persona, e.g. "a senior backend engineer specialising in databases"'),
  })

  try {
    const { output } = await generateText({
      model: languageModel(PREP_MODEL),
      output: Output.object({ schema }),
      maxOutputTokens: 2000,
      instructions:
        'You help build prompts for an experiment comparing prompting strategies. Keep examples concise and high quality. Never solve the user task itself.',
      prompt: `User task:\n"""\n${task}\n"""\n\nProduce ${exampleCount} worked example(s) of SIMILAR but DIFFERENT tasks with ideal outputs, each output under 120 words. Also describe the single best expert persona to answer the user task (lowercase, starting with "a" or "an").`,
    })
    return {
      examples: output.examples.slice(0, exampleCount),
      role: output.role.trim() || DEFAULT_ROLE,
    }
  } catch {
    return { examples: [], role: DEFAULT_ROLE }
  }
}
