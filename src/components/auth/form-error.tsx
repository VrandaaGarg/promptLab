import { CircleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { collapse } from '@/lib/motion'

export function FormError({ message }: { message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
