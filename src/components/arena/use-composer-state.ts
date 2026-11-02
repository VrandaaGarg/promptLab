import { useState } from 'react'
import { MAX_STRATEGIES_PER_RUN, MAX_TASK_LENGTH } from '@/lib/domain'
import { DEFAULT_MODEL, type ModelId } from '@/lib/models'
import type { CreateRunInput } from '@/server/runs'
import type { Strategy } from '@/server/strategies'
import { isCompleteExample, isPartialExample, type ExampleDraft } from './examples-editor'

/** Local draft state for the arena composer and its conversion into a run request. */
export function useComposerState({
  strategies,
  initialTask = '',
  initialModel = DEFAULT_MODEL,
}: {
  strategies: Strategy[]
  initialTask?: string
  initialModel?: ModelId
}) {
  const [task, setTask] = useState(initialTask)
  const [model, setModel] = useState<ModelId>(initialModel)
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(strategies.filter((s) => s.userId === null).map((s) => s.id)),
  )
  const [blindMode, setBlindMode] = useState(false)
  const [examples, setExamples] = useState<ExampleDraft[]>([])

  // Drop selections for strategies that no longer exist (e.g. deleted in another tab).
  const strategyIds = strategies.filter((s) => selected.has(s.id)).map((s) => s.id)
  const trimmed = task.trim()
  const tooLong = task.length > MAX_TASK_LENGTH
  const hasPartialExample = examples.some(isPartialExample)
  const canSubmit =
    trimmed.length > 0 &&
    !tooLong &&
    strategyIds.length > 0 &&
    strategyIds.length <= MAX_STRATEGIES_PER_RUN &&
    !hasPartialExample

  const toggleStrategy = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (!next.delete(id) && next.size < MAX_STRATEGIES_PER_RUN) next.add(id)
      return next
    })

  /** Selects every strategy, keeping current picks first when the per-run limit applies. */
  const selectAllStrategies = () =>
    setSelected(
      new Set(
        [...strategyIds, ...strategies.map((s) => s.id).filter((id) => !selected.has(id))].slice(
          0,
          MAX_STRATEGIES_PER_RUN,
        ),
      ),
    )

  const clearStrategies = () => setSelected(new Set())

  const toInput = (): CreateRunInput => ({
    task: trimmed,
    model,
    strategyIds,
    blindMode,
    examples: examples.filter(isCompleteExample).map((e) => ({ input: e.input.trim(), output: e.output.trim() })),
  })

  return {
    task,
    setTask,
    model,
    setModel,
    selected,
    toggleStrategy,
    selectAllStrategies,
    clearStrategies,
    selectedCount: strategyIds.length,
    blindMode,
    setBlindMode,
    examples,
    setExamples,
    tooLong,
    canSubmit,
    toInput,
  }
}
