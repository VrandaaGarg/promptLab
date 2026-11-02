import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import type { Example } from '@/lib/domain'
import { collapse } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Collapsible list of the worked examples injected into one-/few-shot prompts. */
export function RunExamples({ examples }: { examples: Example[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  if (examples.length === 0) return null

  return (
    <section className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-surface-2"
      >
        <ChevronRight aria-hidden="true" className={cn('size-4 text-muted-foreground transition-transform duration-200', open && 'rotate-90')} />
        <span className="font-medium">Examples used</span>
        <span className="font-mono text-xs text-muted-foreground">{examples.length}</span>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Injected into one-shot and few-shot prompts</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
            <ol className="grid gap-3 border-t border-border p-4 md:grid-cols-2">
              {examples.map((example, i) => (
                <li key={i} className="space-y-2 rounded-md bg-surface-2 p-3 text-xs leading-relaxed">
                  <p className="font-mono text-[11px] text-muted-foreground">Example {i + 1}</p>
                  <div>
                    <p className="font-medium text-muted-foreground">Input</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">{example.input}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Output</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">{example.output}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
