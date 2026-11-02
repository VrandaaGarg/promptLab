import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Checkbox indicator. Purely visual: the owning control (e.g. a listbox option) carries the
 * checked state for assistive technology.
 */
export function Checkbox({ checked, disabled, className }: { checked: boolean; disabled?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-surface',
        disabled && 'opacity-50',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="inline-flex"
          >
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
