import { generateText, Output } from 'ai'
import { z } from 'zod'
import { TASK_CATEGORIES, type JudgeScore, type TaskCategory } from '@/lib/domain'
import { languageModel } from './provider'

type Candidate = { id: string; output: string }

type JudgeResult = { category: TaskCategory; scores: Map<string, JudgeScore> }

const score = z.number().min(1).max(10)

const judgeSchema = z.object({
  category: z.enum(TASK_CATEGORIES),
  evaluations: z.array(
    z.object({
      label: z.string().describe('The response label, e.g. "A"'),
      accuracy: score,
      clarity: score,
      completeness: score,
      overall: score,
      reason: z.string().describe('One or two sentences justifying the scores'),
    }),
  ),
})

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Scores anonymised responses so the judge cannot favour a strategy by name.
 * Also classifies the task category.
 */
export async function judgeResponses(task: string, judgeModel: string, candidates: Candidate[]): Promise<JudgeResult> {
  const labelled = candidates.map((c, i) => ({ ...c, label: LABELS[i] ?? String(i + 1) }))

  const { output } = await generateText({
    model: languageModel(judgeModel),
    output: Output.object({ schema: judgeSchema }),
    maxOutputTokens: 2500,
    temperature: 0,
    instructions:
      'You are a strict, impartial evaluator of AI responses. Score each response independently on a 1-10 scale. Be calibrated: reserve 9-10 for genuinely excellent answers. Ignore length unless it hurts quality.',
    prompt: [
      `Task given to the assistant:\n"""\n${task}\n"""`,
      ...labelled.map((c) => `Response ${c.label}:\n"""\n${c.output}\n"""`),
      `Evaluate every response (labels: ${labelled.map((c) => c.label).join(', ')}) for accuracy, clarity, completeness and overall quality. Also classify the task into one category: ${TASK_CATEGORIES.join(', ')}.`,
    ].join('\n\n'),
  })

  const scores = new Map<string, JudgeScore>()
  for (const evaluation of output.evaluations) {
    const match = labelled.find((c) => c.label === evaluation.label.trim().toUpperCase())
    if (!match) continue
    const { label: _label, ...rest } = evaluation
    scores.set(match.id, rest)
  }
  return { category: output.category, scores }
}
