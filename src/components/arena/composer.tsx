import { ArrowUp, Eye, EyeOff, ListPlus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Kbd } from '@/components/ui/kbd'
import { Textarea } from '@/components/ui/textarea'
import { chipClassName, ToggleChip } from '@/components/ui/toggle-chip'
import { Tooltip } from '@/components/ui/tooltip'
import { useIsApplePlatform } from '@/hooks/use-platform'
import { MAX_TASK_LENGTH } from '@/lib/domain'
import { formatNumber } from '@/lib/format'
import type { ModelId } from '@/lib/models'
import { collapse } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { CreateRunInput } from '@/server/runs'
import type { Strategy } from '@/server/strategies'
import { ExamplesEditor, isCompleteExample } from './examples-editor'
import { ModelSelect } from './model-select'
import { StrategySelect } from './strategy-select'
import { TaskSuggestions } from './task-suggestions'
import { useComposerState } from './use-composer-state'

export type ComposerProps = {
  strategies: Strategy[]
  initialTask?: string
  initialModel?: ModelId
  pending: boolean
  onSubmit: (input: CreateRunInput) => Promise<void>
}

export function Composer({ strategies, initialTask, initialModel, pending, onSubmit }: ComposerProps) {
  const state = useComposerState({ strategies, initialTask, initialModel })
  const [examplesOpen, setExamplesOpen] = useState(false)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const isApple = useIsApplePlatform()
  const ids = { task: useId(), examples: useId(), counter: useId() }
  const customExampleCount = state.examples.filter(isCompleteExample).length
  const nearLimit = state.task.length >= MAX_TASK_LENGTH * 0.9

  const submit = async () => {
    if (!state.canSubmit || pending) return
    try {
      await onSubmit(state.toInput())
    } catch {
      // The mutation hook already reports the error.
    }
  }

  return (
    <div className="space-y-5">
      <form
        aria-label="New run"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            void submit()
          }
        }}
      >
        <Card className="transition-colors has-[textarea:focus]:border-border-strong">
          <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <label htmlFor={ids.task} className="sr-only">
              Task
            </label>
            <Textarea
              ref={textarea}
              id={ids.task}
              autosize
              rows={3}
              value={state.task}
              onChange={(e) => state.setTask(e.target.value)}
              disabled={pending}
              aria-describedby={nearLimit ? ids.counter : undefined}
              aria-invalid={state.tooLong || undefined}
              placeholder="Describe a task to run through every strategy…"
              className="min-h-24 rounded-none border-0 bg-transparent p-0 text-[15px] leading-relaxed focus-visible:outline-none disabled:opacity-70"
            />
          </div>

          <AnimatePresence initial={false}>
            {examplesOpen && (
              <motion.div
                id={ids.examples}
                variants={collapse}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="border-t border-border px-4 py-5 sm:px-5">
                  <ExamplesEditor examples={state.examples} onChange={state.setExamples} disabled={pending} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2.5 sm:px-4">
            <ModelSelect value={state.model} onChange={state.setModel} disabled={pending} />
            <StrategySelect
              strategies={strategies}
              selected={state.selected}
              onToggle={state.toggleStrategy}
              onSelectAll={state.selectAllStrategies}
              onClear={state.clearStrategies}
              disabled={pending}
            />
            <Tooltip
            align="start"
            content="Hide strategy names and judge scores until you've rated every response, so your ratings aren't biased.">
              <ToggleChip
                pressed={state.blindMode}
                onPressedChange={state.setBlindMode}
                disabled={pending}
                icon={state.blindMode ? <EyeOff aria-hidden="true" className="size-3.5" /> : <Eye aria-hidden="true" className="size-3.5" />}
              >
                Blind
              </ToggleChip>
            </Tooltip>
            <button
              type="button"
              aria-expanded={examplesOpen}
              aria-controls={ids.examples}
              onClick={() => setExamplesOpen((v) => !v)}
              disabled={pending}
              className={chipClassName({ active: examplesOpen })}
            >
              <ListPlus aria-hidden="true" className="size-3.5" />
              Examples
              {customExampleCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 font-mono text-[10px] leading-4 text-primary-foreground">
                  {customExampleCount}
                  <span className="sr-only"> added</span>
                </span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-3 pl-1">
              {nearLimit && (
                <span
                  id={ids.counter}
                  className={cn('font-mono text-[11px] tabular-nums', state.tooLong ? 'text-destructive' : 'text-warning')}
                >
                  {formatNumber(state.task.length)} / {formatNumber(MAX_TASK_LENGTH)}
                  <span className="sr-only"> characters</span>
                </span>
              )}
              <span aria-hidden="true" className="hidden items-center gap-1 sm:inline-flex">
                <Kbd className={isApple ? 'font-sans text-xs' : undefined}>{isApple ? '⌘' : 'Ctrl'}</Kbd>
                <Kbd>↵</Kbd>
              </span>
              <Button type="submit" size="sm" loading={pending} disabled={!state.canSubmit} className="h-8 rounded-full px-3.5">
                {pending ? (
                  'Preparing…'
                ) : (
                  <>
                    <ArrowUp aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      <AnimatePresence initial={false}>
        {!state.task.trim() && !pending && (
          <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
            <TaskSuggestions
              onPick={(task) => {
                state.setTask(task)
                requestAnimationFrame(() => textarea.current?.focus())
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
