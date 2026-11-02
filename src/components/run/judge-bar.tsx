import { CircleAlert, Crown, RotateCcw, Scale } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { isInFlight } from '@/lib/domain'
import { getModelLabel } from '@/lib/models'
import type { RunResponse } from '@/server/runs'
import { ResponseName } from './response-name'
import type { ResponseIdentity, RunLiveState } from './types'

type JudgeBarProps = {
  responses: RunResponse[]
  judgeModel: string
  identityOf: (id: string) => ResponseIdentity
  live?: RunLiveState
}

function Bar({ tone = 'neutral', children }: { tone?: 'neutral' | 'error'; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      className={
        tone === 'error'
          ? 'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive'
          : 'flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm'
      }
    >
      {children}
    </motion.div>
  )
}

/** Status of the AI judge beneath the response grid, with the judge's and the user's picks. */
export function JudgeBar({ responses, judgeModel, identityOf, live }: JudgeBarProps) {
  const judgeLabel = getModelLabel(judgeModel)
  const scored = responses.filter((r) => r.judgeScore)
  const generating = responses.some(isInFlight)
  const anyDone = responses.some((r) => r.status === 'done' && r.output.trim())
  const judgeTop = scored.reduce<RunResponse | undefined>(
    (best, r) => (!best || r.judgeScore!.overall > best.judgeScore!.overall ? r : best),
    undefined,
  )
  const winner = responses.find((r) => r.isWinner)
  const hidden = responses[0] ? identityOf(responses[0].id).hidden : false

  let content: ReactNode = null
  let key = 'none'

  if (live?.isJudging) {
    key = 'judging'
    content = (
      <Bar>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Spinner className="text-primary" />
          AI judge <span className="text-foreground">{judgeLabel}</span> is scoring the responses…
        </span>
      </Bar>
    )
  } else if (live?.judgeError && scored.length === 0) {
    key = 'error'
    content = (
      <Bar tone="error">
        <span className="inline-flex min-w-0 flex-1 items-center gap-2">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0">AI judge failed: {live.judgeError}</span>
        </span>
        <Button size="sm" variant="outline" onClick={live.runJudge}>
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      </Bar>
    )
  } else if (judgeTop) {
    key = 'scored'
    content = (
      <Bar>
        <span className="inline-flex min-w-0 items-center gap-2">
          <Scale aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Judge's pick</span>
          {hidden ? (
            <span className="text-muted-foreground">hidden until you reveal</span>
          ) : (
            <>
              <ResponseName response={judgeTop} identity={identityOf(judgeTop.id)} className="font-medium" />
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{judgeTop.judgeScore!.overall}/10</span>
            </>
          )}
        </span>
        <span className="inline-flex min-w-0 items-center gap-2">
          <Crown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Your pick</span>
          {winner ? (
            <ResponseName response={winner} identity={identityOf(winner.id)} className="font-medium" />
          ) : (
            <span className="text-muted-foreground">not chosen yet</span>
          )}
        </span>
        {!hidden && winner && winner.id === judgeTop.id && (
          <span className="text-xs text-success">You and the judge agree</span>
        )}
        <span className="text-xs text-muted-foreground sm:ml-auto">Scored by {judgeLabel}</span>
      </Bar>
    )
  } else if (live && !generating && !live.isStreaming && anyDone) {
    key = 'idle'
    content = (
      <Bar>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Scale aria-hidden="true" className="size-4" />
          These responses haven't been scored yet.
        </span>
        <Button size="sm" variant="outline" className="sm:ml-auto" onClick={live.runJudge}>
          Run AI judge
        </Button>
      </Bar>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {content && <motion.div key={key}>{content}</motion.div>}
    </AnimatePresence>
  )
}
