import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { CATEGORY_LABELS, type TaskCategory } from '@/lib/domain'
import { fadeUp, staggerContainer } from '@/lib/motion'

const SUGGESTIONS: Array<{ category: TaskCategory; task: string }> = [
  {
    category: 'coding',
    task: 'Write a TypeScript function that returns the longest palindromic substring of a string. Include a few test cases.',
  },
  {
    category: 'reasoning',
    task: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Explain.',
  },
  {
    category: 'writing',
    task: 'Explain how HTTPS keeps data private to a small-business owner with no technical background, in under 150 words.',
  },
  {
    category: 'creative',
    task: 'Write a product description for a minimalist ceramic pour-over coffee set, aimed at design-conscious buyers.',
  },
]

export function TaskSuggestions({ onPick }: { onPick: (task: string) => void }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-medium text-muted-foreground">Try an example task</p>
      <motion.ul
        variants={staggerContainer(0.04)}
        initial="hidden"
        animate="visible"
        className="grid gap-2 sm:grid-cols-2"
      >
        {SUGGESTIONS.map((s) => (
          <motion.li key={s.task} variants={fadeUp}>
            <button
              type="button"
              onClick={() => onPick(s.task)}
              className="group flex h-full w-full items-start gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[s.category]}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-foreground">{s.task}</span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-border-strong transition-colors group-hover:text-primary"
              />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
