import { motion } from 'motion/react'
import { STRATEGY_COLORS } from '@/lib/strategies'
import { fadeIn } from '@/lib/motion'

/** Quiet stand-in for the response grid before the first run. */
export function ArenaPlaceholder() {
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Responses"
      className="rounded-lg border border-dashed border-border-strong p-6 sm:p-8"
    >
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STRATEGY_COLORS.map((color, i) => (
          <div key={color} className={i > 1 ? 'hidden sm:block' : undefined}>
            <span className="block h-0.5 rounded-full opacity-60" style={{ backgroundColor: `var(--${color})` }} />
            <div className="mt-3 space-y-2">
              <span className="block h-2 w-4/5 rounded-full bg-surface-2" />
              <span className="block h-2 w-full rounded-full bg-surface-2" />
              <span className="block h-2 w-3/5 rounded-full bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Responses from each strategy stream here, side by side.
      </p>
    </motion.section>
  )
}
