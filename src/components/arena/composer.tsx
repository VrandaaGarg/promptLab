import { Link } from '@tanstack/react-router'
import { ChevronDown, Info, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Kbd } from '@/components/ui/kbd'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { ModelPicker } from './model-picker'
import { StrategyPicker } from './strategy-picker'
import { TaskSuggestions } from './task-suggestions'
import { useComposerState } from './use-composer-state'

export type ComposerProps = {
  strategies: Strategy[]
  initialTask?: string
  initialModel?: ModelId
  pending: boolean
  onSubmit: (input: CreateRunInput) => Promise<void>
}

function Section({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</h2>
        {aside}
      </div>
      {children}
    </div>
  )
}

export function Composer({ strategies, initialTask, initialModel, pending, onSubmit }: ComposerProps) {
  const state = useComposerState({ strategies, initialTask, initialModel })
  const [examplesOpen, setExamplesOpen] = useState(false)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const isApple = useIsApplePlatform()
  const ids = { task: useId(), blind: useId(), examples: useId(), counter: useId() }
  const customExampleCount = state.examples.filter(isCompleteExample).length

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
          <div className="px-4 pt-4 sm:px-5 sm:pt-5">
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
              aria-describedby={ids.counter}
              aria-invalid={state.tooLong || undefined}
              placeholder="Describe a task to run through every strategy…"
              className="min-h-24 rounded-none border-0 bg-transparent p-0 text-[15px] leading-relaxed focus-visible:outline-none disabled:opacity-70"
            />
          </div>
          <div className="flex items-center justify-end px-4 pb-3 sm:px-5">
            <span
              id={ids.counter}
              className={cn('font-mono text-[11px] tabular-nums', state.tooLong ? 'text-destructive' : 'text-muted-foreground')}
            >
              {formatNumber(state.task.length)} / {formatNumber(MAX_TASK_LENGTH)}
              <span className="sr-only"> characters</span>
            </span>
          </div>

          <div className="space-y-5 border-t border-border px-4 py-5 sm:px-5">
            <Section label="Model">
              <ModelPicker value={state.model} onChange={state.setModel} disabled={pending} />
            </Section>
            <Section
              label="Strategies"
              aside={
                <Link to="/strategies" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  Manage strategies
                </Link>
              }
            >
              <StrategyPicker
                strategies={strategies}
                selected={state.selected}
                onToggle={state.toggleStrategy}
                disabled={pending}
              />
            </Section>
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

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Switch
                id={ids.blind}
                checked={state.blindMode}
                onCheckedChange={state.setBlindMode}
                disabled={pending}
              />
              <label htmlFor={ids.blind} className="text-sm">
                Blind mode
              </label>
              <Tooltip content="Hide strategy names and judge scores until you've rated every response, so your ratings aren't biased.">
                <button type="button" aria-label="About blind mode" className="rounded text-muted-foreground transition-colors hover:text-foreground">
                  <Info className="size-3.5" />
                </button>
              </Tooltip>
            </div>

            <button
              type="button"
              aria-expanded={examplesOpen}
              aria-controls={ids.examples}
              onClick={() => setExamplesOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown aria-hidden="true" className={cn('size-4 transition-transform duration-200', examplesOpen && 'rotate-180')} />
              Custom examples
              <span className="text-xs">(optional)</span>
              {customExampleCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 font-mono text-[11px] text-primary">{customExampleCount}</span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span aria-hidden="true" className="hidden items-center gap-1 sm:inline-flex">
                <Kbd className={isApple ? 'font-sans text-xs' : undefined}>{isApple ? '⌘' : 'Ctrl'}</Kbd>
                <Kbd>Enter</Kbd>
              </span>
              <Button type="submit" loading={pending} disabled={!state.canSubmit}>
                {pending ? (
                  'Preparing…'
                ) : (
                  <>
                    <Play aria-hidden="true" className="size-3.5 fill-current" />
                    Run {state.selectedCount === 1 ? '1 strategy' : `${state.selectedCount} strategies`}
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
