import { Eye, EyeOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { collapse } from '@/lib/motion'

export function BlindBanner({
  hidden,
  ratedCount,
  doneCount,
  onReveal,
}: {
  hidden: boolean
  ratedCount: number
  doneCount: number
  onReveal: () => void
}) {
  return (
    <AnimatePresence initial={false}>
      {hidden && (
        <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-surface-2 px-4 py-3 text-sm">
            <EyeOff aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <p className="min-w-[14rem] flex-1 text-muted-foreground">
              <span className="font-medium text-foreground">Blind mode.</span> Strategies and judge scores stay hidden until
              you've rated every response.
              {doneCount > 0 && (
                <span className="ml-1.5 font-mono text-xs tabular-nums">
                  {ratedCount}/{doneCount} rated
                </span>
              )}
            </p>
            <Button variant="outline" size="sm" onClick={onReveal}>
              <Eye className="size-3.5" />
              Reveal strategies
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
