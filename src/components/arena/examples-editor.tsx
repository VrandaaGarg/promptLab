import { Plus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MAX_EXAMPLES } from '@/lib/domain'
import { collapse } from '@/lib/motion'

export type ExampleDraft = { key: string; input: string; output: string }

export const isPartialExample = (e: ExampleDraft) => Boolean(e.input.trim()) !== Boolean(e.output.trim())
export const isCompleteExample = (e: ExampleDraft) => Boolean(e.input.trim() && e.output.trim())

let nextKey = 0
const emptyExample = (): ExampleDraft => ({ key: `example-${nextKey++}`, input: '', output: '' })

export function ExamplesEditor({
  examples,
  onChange,
  disabled,
}: {
  examples: ExampleDraft[]
  onChange: (examples: ExampleDraft[]) => void
  disabled?: boolean
}) {
  const update = (key: string, patch: Partial<ExampleDraft>) =>
    onChange(examples.map((e) => (e.key === key ? { ...e, ...patch } : e)))

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Used by one-shot and few-shot strategies, which take the first one or three. Leave empty and PromptLab generates
        relevant examples for you.
      </p>
      <ol className="space-y-3">
        <AnimatePresence initial={false}>
          {examples.map((example, i) => {
            const partial = isPartialExample(example)
            return (
              <motion.li
                key={example.key}
                variants={collapse}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div role="group" aria-label={`Example ${i + 1}`} className="rounded-md border border-border bg-surface-2/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span aria-hidden="true" className="font-mono text-[11px] text-muted-foreground">Example {i + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      aria-label={`Remove example ${i + 1}`}
                      disabled={disabled}
                      onClick={() => onChange(examples.filter((e) => e.key !== example.key))}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Textarea
                      autosize
                      rows={2}
                      aria-label={`Example ${i + 1} input`}
                      placeholder="Input"
                      value={example.input}
                      maxLength={2000}
                      disabled={disabled}
                      onChange={(e) => update(example.key, { input: e.target.value })}
                      className="min-h-16 text-[13px]"
                    />
                    <Textarea
                      autosize
                      rows={2}
                      aria-label={`Example ${i + 1} output`}
                      placeholder="Ideal output"
                      value={example.output}
                      maxLength={4000}
                      disabled={disabled}
                      onChange={(e) => update(example.key, { output: e.target.value })}
                      className="min-h-16 text-[13px]"
                    />
                  </div>
                  {partial && <p className="mt-2 text-xs text-destructive">Fill in both the input and the output, or remove this example.</p>}
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ol>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || examples.length >= MAX_EXAMPLES}
        onClick={() => onChange([...examples, emptyExample()])}
      >
        <Plus className="size-3.5" />
        Add example
        <span className="font-mono text-muted-foreground">
          {examples.length}/{MAX_EXAMPLES}
        </span>
      </Button>
    </div>
  )
}
