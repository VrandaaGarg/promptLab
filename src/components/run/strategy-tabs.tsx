import { Crown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { strategyColor } from '@/components/common/strategy-visual'
import { formatScore } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { ResponseName } from './response-name'
import { ResponseStatus } from './response-status'
import type { ResponseIdentity } from './types'

export const tabId = (prefix: string, responseId: string) => `${prefix}-tab-${responseId}`
export const panelId = (prefix: string) => `${prefix}-panel`

type StrategyTabsProps = {
  responses: RunResponse[]
  activeId: string
  onSelect: (id: string) => void
  identityOf: (id: string) => ResponseIdentity
  /** Unique prefix tying tabs to the panel (from useId). */
  idPrefix: string
}

/** ARIA tab list of strategies with live status, judge score and the user's pick. */
export function StrategyTabs({ responses, activeId, onSelect, identityOf, idPrefix }: StrategyTabsProps) {
  const tabs = useRef(new Map<string, HTMLButtonElement>())
  const mounted = useRef(false)
  const reduceMotion = useReducedMotion()

  // Keep the active tab visible when it changes (keyboard, leaderboard), not on first paint.
  useEffect(() => {
    if (mounted.current) {
      tabs.current.get(activeId)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
    }
    mounted.current = true
  }, [activeId, reduceMotion])

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = responses.length - 1
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    const id = next === null ? undefined : responses[next]?.id
    if (!id) return
    event.preventDefault()
    onSelect(id)
    tabs.current.get(id)?.focus()
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Strategies" className="relative flex w-max min-w-full gap-1">
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />
        {responses.map((response, index) => {
          const identity = identityOf(response.id)
          const selected = response.id === activeId
          const score = !identity.hidden ? response.judgeScore?.overall : undefined
          return (
            <button
              key={response.id}
              ref={(el) => {
                if (el) tabs.current.set(response.id, el)
                else tabs.current.delete(response.id)
              }}
              type="button"
              role="tab"
              id={tabId(idPrefix, response.id)}
              aria-selected={selected}
              aria-controls={panelId(idPrefix)}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(response.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                'relative flex h-11 shrink-0 items-center gap-2.5 rounded-t-md px-3 text-sm transition-colors focus-visible:outline-offset-[-2px]',
                selected ? 'text-foreground' : 'text-muted-foreground hover:bg-surface-2/60 hover:text-foreground',
              )}
            >
              <ResponseName response={response} identity={identity} className="max-w-56 font-medium" />
              <ResponseStatus status={response.status} compact />
              {score !== undefined && (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  <span className="sr-only">Judge score </span>
                  {formatScore(score)}
                </span>
              )}
              {response.isWinner && (
                <>
                  <Crown aria-hidden="true" className="size-3.5 fill-current text-primary" />
                  <span className="sr-only">Your pick</span>
                </>
              )}
              {selected && (
                <motion.span
                  layoutId={`${idPrefix}-indicator`}
                  aria-hidden="true"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute inset-x-2 bottom-0 z-10 h-0.5 rounded-full"
                  style={{ backgroundColor: identity.hidden ? 'var(--foreground)' : strategyColor(response.color) }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
