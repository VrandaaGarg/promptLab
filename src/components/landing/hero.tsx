import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { buttonVariants } from '@/components/ui/button'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { ArenaPreview } from './arena-preview'

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="max-w-3xl">
        <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
          Prompt engineering, measured
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-5 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl"
        >
          See which prompt actually works.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          PromptLab sends one task through zero-shot, few-shot, chain-of-thought and role-based prompts at once. Watch
          them stream side by side, inspect the exact prompts, and let ratings and an AI judge show what wins over time.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
          {signedIn ? (
            <Link to="/arena" className={buttonVariants({ size: 'lg' })}>
              Open the arena
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link to="/signup" className={buttonVariants({ size: 'lg' })}>
                Get started free
                <ArrowRight className="size-4" />
              </Link>
              <Link to="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                Sign in
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
        className="mt-16 sm:mt-20"
      >
        <ArenaPreview />
      </motion.div>
    </section>
  )
}
