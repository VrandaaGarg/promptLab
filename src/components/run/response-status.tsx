import { Check, CircleAlert } from 'lucide-react'
import { motion } from 'motion/react'
import { Spinner } from '@/components/ui/spinner'
import type { ResponseStatus as Status } from '@/lib/domain'
import { cn } from '@/lib/utils'

const labels: Record<Status, string> = { pending: 'Waiting', streaming: 'Streaming', done: 'Done', error: 'Error' }

/** Generation status. `compact` shows only the icon (the label stays for screen readers). */
export function ResponseStatus({ status, compact = false, className }: { status: Status; compact?: boolean; className?: string }) {
  return (
    <span
      role={compact ? undefined : 'status'}
      aria-live={compact ? undefined : 'polite'}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 text-xs',
        status === 'error' ? 'text-destructive' : status === 'streaming' ? 'text-primary' : 'text-muted-foreground',
        className,
      )}
    >
      {status === 'pending' && <Spinner className="size-3" />}
      {status === 'streaming' && (
        <motion.span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-primary"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {status === 'done' && <Check aria-hidden="true" className="size-3.5 text-success" />}
      {status === 'error' && <CircleAlert aria-hidden="true" className="size-3.5" />}
      <span className={cn((compact || status === 'done') && 'sr-only')}>{labels[status]}</span>
    </span>
  )
}
