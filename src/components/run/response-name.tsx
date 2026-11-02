import { AnimatePresence, motion } from 'motion/react'
import { StrategyIcon, StrategyLabel, strategyColor } from '@/components/common/strategy-visual'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import type { ResponseIdentity } from './types'

type ResponseNameProps = {
  response: Pick<RunResponse, 'strategyName' | 'color' | 'icon'>
  identity: ResponseIdentity
  className?: string
}

/** Plain-text name for a response, honouring blind mode. */
export function responseNameText(response: Pick<RunResponse, 'strategyName'>, identity: ResponseIdentity) {
  return identity.hidden ? `Response ${identity.letter}` : response.strategyName
}

/** Inline name honouring blind mode: anonymous letter, or the strategy's dot, icon and name. */
export function ResponseName({ response, identity, className }: ResponseNameProps) {
  if (identity.hidden) {
    return (
      <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-border-strong" />
        <span className="truncate">Response {identity.letter}</span>
      </span>
    )
  }
  return <StrategyLabel name={response.strategyName} color={response.color} icon={response.icon} className={className} />
}

/** Card heading with an animated hand-off from the anonymous letter to the strategy. */
export function ResponseHeading({ response, identity }: ResponseNameProps) {
  return (
    <h3 className="min-w-0 flex-1 text-sm font-medium">
      <AnimatePresence mode="wait" initial={false}>
        {identity.hidden ? (
          <motion.span
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            className="flex min-w-0 items-center gap-2"
          >
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-xs text-muted-foreground">
              {identity.letter}
            </span>
            <span className="truncate">Response {identity.letter}</span>
          </motion.span>
        ) : (
          <motion.span
            key="revealed"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex min-w-0 items-center gap-2"
          >
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-md"
              style={{
                color: strategyColor(response.color),
                backgroundColor: `color-mix(in srgb, ${strategyColor(response.color)} 14%, transparent)`,
              }}
            >
              <StrategyIcon icon={response.icon} />
            </span>
            <span className="truncate">{response.strategyName}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </h3>
  )
}
