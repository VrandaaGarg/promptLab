import { CircleAlert, Crown, RotateCcw, Scale } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { strategyColor } from '@/components/common/strategy-visual'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { isInFlight } from '@/lib/domain'
import { formatScore } from '@/lib/format'
import { getModelLabel } from '@/lib/models'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { ScoreBar } from './judge-score'
import { ResponseName } from './response-name'
import type { ResponseIdentity, RunLiveState } from './types'

type RunSummaryProps = {
  responses: RunResponse[]
  judgeModel: string
  identityOf: (id: string) => ResponseIdentity
  live?: RunLiveState
  activeId?: string
  onSelect: (id: string) => void
}

function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'error'; children: ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-4 py-3 text-sm',
        tone === 'error' ? 'bg-destructive/10 text-destructive' : 'border border-border bg-surface',
      )}
    >
      {children}
    </div>
  )
}

function Pick({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 flex min-w-0 items-center gap-2 text-sm">{children}</dd>
    </div>
  )
}

const byScore = (a: RunResponse, b: RunResponse) => (b.judgeScore?.overall ?? -1) - (a.judgeScore?.overall ?? -1)

/** Verdict beneath the panel: judge's and user's picks plus a leaderboard that switches tabs. */
export function RunSummary({ responses, judgeModel, identityOf, live, activeId, onSelect }: RunSummaryProps) {
  const judgeLabel = getModelLabel(judgeModel)
  const ranked = [...responses].sort(byScore)
  const judgeTop = ranked[0]?.judgeScore ? ranked[0] : undefined
  const winner = responses.find((r) => r.isWinner)
  const hidden = responses[0] ? identityOf(responses[0].id).hidden : false
  const generating = responses.some(isInFlight)
  const anyDone = responses.some((r) => r.status === 'done' && r.output.trim())

  let key = 'none'
  let content: ReactNode = null

  if (live?.isJudging) {
    key = 'judging'
    content = (
      <Notice>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Spinner className="text-primary" />
          AI judge <span className="text-foreground">{judgeLabel}</span> is scoring…
        </span>
      </Notice>
    )
  } else if (live?.judgeError && !judgeTop) {
    key = 'error'
    content = (
      <Notice tone="error">
        <span className="inline-flex min-w-0 flex-1 items-center gap-2">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0">AI judge failed: {live.judgeError}</span>
        </span>
        <Button size="sm" variant="outline" onClick={live.runJudge}>
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      </Notice>
    )
  } else if (judgeTop) {
    key = 'scored'
    content = (
      <section
        aria-label="Results summary"
        className="grid gap-6 rounded-lg border border-border bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10"
      >
        <div className="space-y-4">
          <dl className="space-y-4">
            <Pick icon={<Scale aria-hidden="true" className="size-3.5" />} label="Judge's pick">
              {hidden ? (
                <span className="text-muted-foreground">Hidden until you reveal</span>
              ) : (
                <>
                  <ResponseName response={judgeTop} identity={identityOf(judgeTop.id)} className="font-medium" />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatScore(judgeTop.judgeScore!.overall)}</span>
                </>
              )}
            </Pick>
            <Pick icon={<Crown aria-hidden="true" className="size-3.5" />} label="Your pick">
              {winner ? (
                <ResponseName response={winner} identity={identityOf(winner.id)} className="font-medium" />
              ) : (
                <span className="text-muted-foreground">Not chosen yet</span>
              )}
            </Pick>
          </dl>
          <p className="text-xs text-muted-foreground">
            {!hidden && winner?.id === judgeTop.id && <span className="text-success">You and the judge agree. </span>}
            Scored by {judgeLabel}.
          </p>
        </div>

        {hidden ? (
          <p className="self-center text-sm text-muted-foreground">Scores stay hidden until you reveal the strategies.</p>
        ) : (
          <ol aria-label="Judge leaderboard" className="space-y-0.5 self-center">
            {ranked.map((response, i) => {
              const score = response.judgeScore?.overall
              const active = response.id === activeId
              return (
                <li key={response.id}>
                  <button
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => onSelect(response.id)}
                    className={cn(
                      'grid w-full grid-cols-[1rem_minmax(0,8.5rem)_minmax(0,1fr)_2rem] items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors sm:grid-cols-[1rem_minmax(0,12rem)_minmax(0,1fr)_2rem]',
                      active ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                    )}
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                    <ResponseName response={response} identity={identityOf(response.id)} />
                    {score !== undefined ? <ScoreBar value={score} color={strategyColor(response.color)} /> : <span />}
                    <span className="text-right font-mono text-xs tabular-nums">{formatScore(score)}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    )
  } else if (live && !generating && !live.isStreaming && anyDone) {
    key = 'idle'
    content = (
      <Notice>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Scale aria-hidden="true" className="size-4" />
          These responses haven't been scored yet.
        </span>
        <Button size="sm" variant="outline" className="sm:ml-auto" onClick={live.runJudge}>
          Run AI judge
        </Button>
      </Notice>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {content && (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
