import { motion } from 'motion/react'
import { HighlightedText, VARIABLE_HIGHLIGHTS } from '@/components/common/prompt-block'
import { StrategyIcon, strategyColor } from '@/components/common/strategy-visual'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { BUILT_IN_STRATEGIES } from '@/lib/strategies'

const firstLine = (text: string) => text.split('\n').find((line) => line.trim()) ?? text

export function StrategyShowcase() {
  return (
    <section aria-labelledby="strategies-heading" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h2 id="strategies-heading" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Five strategies, one task.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The classics of prompt engineering, ready out of the box. Write your own with a simple template language and
            race them against these.
          </p>
        </div>
        <motion.ol
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="divide-y divide-border"
        >
          {BUILT_IN_STRATEGIES.map((strategy, i) => (
            <motion.li
              key={strategy.slug}
              variants={fadeUp}
              className="grid gap-x-6 gap-y-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[2.5rem_11rem_minmax(0,1fr)]"
            >
              <span className="font-mono text-xs leading-5 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex h-5 items-center gap-2 text-sm font-medium">
                <span className="inline-flex" style={{ color: strategyColor(strategy.color) }}>
                  <StrategyIcon icon={strategy.icon} className="size-4" />
                </span>
                {strategy.name}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-muted-foreground">{strategy.description}</p>
                <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
                  <HighlightedText
                    text={firstLine(strategy.systemPrompt ?? strategy.template)}
                    highlights={VARIABLE_HIGHLIGHTS}
                  />
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
