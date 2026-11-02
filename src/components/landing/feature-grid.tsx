import { ChartLine, Columns3, FileSearch, Scale, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { fadeUp, staggerContainer } from '@/lib/motion'

const FEATURES: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Columns3,
    title: 'Side-by-side streaming',
    body: 'Every strategy runs in parallel against the same model. Responses stream into their own columns, so differences are obvious as they happen.',
  },
  {
    icon: FileSearch,
    title: 'Prompt inspector',
    body: 'See the exact system and user prompt each strategy sent, with injected examples and generated roles highlighted. Nothing is hidden.',
  },
  {
    icon: Scale,
    title: 'AI judge and blind rating',
    body: 'An independent model scores accuracy, clarity and completeness. Rate responses blind first, so the strategy name never sways you.',
  },
  {
    icon: ChartLine,
    title: 'Insights over time',
    body: 'Win rates, average scores, cost and tokens per strategy, broken down by task category. Learn which approach suits which kind of work.',
  },
]

export function FeatureGrid() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 id="features-heading" className="max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        Make prompt engineering visible, comparable and measurable.
      </h2>
      <motion.ul
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
      >
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <motion.li key={title} variants={fadeUp} className="bg-background p-6 sm:p-8">
            <Icon aria-hidden="true" className="size-5 text-primary" />
            <h3 className="mt-5 text-base font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
