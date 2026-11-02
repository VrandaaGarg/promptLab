import { AnimatePresence, motion } from 'motion/react'
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-haspopup'?: 'dialog' | 'true'
}

export type PopoverProps = {
  trigger: ReactElement<TriggerProps>
  children: ReactNode | ((close: () => void) => ReactNode)
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  /** Accessible name for the popover panel. */
  label: string
  className?: string
}

const alignments = { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0' } as const

/** Click-to-open, non-modal floating panel. Closes on outside click and Escape. */
export function Popover({ trigger, children, side = 'bottom', align = 'end', label, className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  const id = useId()
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      root.current?.querySelector<HTMLElement>('[aria-controls]')?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span ref={root} className="relative inline-flex">
      {cloneElement(trigger, {
        'aria-expanded': open,
        'aria-controls': id,
        'aria-haspopup': 'dialog',
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event)
          setOpen((value) => !value)
        },
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="dialog"
            aria-label={label}
            initial={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-40 min-w-48 rounded-lg border border-border bg-surface p-1.5 text-sm text-foreground',
              side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
              alignments[align],
              className,
            )}
          >
            {typeof children === 'function' ? children(close) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
