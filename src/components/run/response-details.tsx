import { CircleAlert, Crown, EyeOff, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StarRating } from '@/components/ui/star-rating'
import { formatCost, formatTokens } from '@/lib/format'
import { getModelLabel } from '@/lib/models'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { JudgeScoreBreakdown } from './judge-score'
import { responseNameText } from './response-name'
import type { ResponseIdentity, RunLiveState } from './types'

type ResponseDetailsProps = {
  response: RunResponse
  identity: ResponseIdentity
  judgeModel: string
  editable: boolean
  live?: RunLiveState
  onRate: (rating: number | null) => void
  onToggleWinner: (isWinner: boolean) => void
}

function Section({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <section className="p-4 sm:p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h4>
        {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
      </header>
      {children}
    </section>
  )
}

const Note = ({ children }: { children: ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>

function Rating({ response, identity, editable, onRate, onToggleWinner }: ResponseDetailsProps) {
  if (response.status !== 'done') return <Note>Rate this response once it finishes.</Note>
  const name = responseNameText(response, identity)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <StarRating
        value={response.rating ?? 0}
        readOnly={!editable}
        onChange={(value) => onRate(value === response.rating ? null : value)}
        aria-label={`Your rating for ${name}`}
      />
      {editable ? (
        <Button
          variant="outline"
          size="sm"
          aria-pressed={response.isWinner}
          onClick={() => onToggleWinner(!response.isWinner)}
          className={cn(response.isWinner && 'border-transparent bg-accent text-primary hover:bg-accent/70')}
        >
          <Crown className={cn('size-3.5', response.isWinner && 'fill-current')} />
          {response.isWinner ? 'Your best' : 'Mark as best'}
        </Button>
      ) : (
        response.isWinner && (
          <Badge variant="primary">
            <Crown aria-hidden="true" className="size-3 fill-current" />
            Best
          </Badge>
        )
      )}
    </div>
  )
}

function Judge({ response, identity, live }: ResponseDetailsProps) {
  if (identity.hidden) {
    return (
      <Note>
        <EyeOff aria-hidden="true" className="mr-1.5 inline size-3.5 align-[-2px]" />
        Hidden until you reveal the strategies.
      </Note>
    )
  }
  if (response.judgeScore) return <JudgeScoreBreakdown score={response.judgeScore} />
  if (response.status === 'error') return <Note>Nothing to score.</Note>
  if (response.status !== 'done') return <Note>Scored after every response finishes.</Note>
  if (live?.isJudging) {
    return (
      <p role="status" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="text-primary" />
        Scoring…
      </p>
    )
  }
  if (live?.judgeError) {
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2 text-sm text-destructive">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 break-words">{live.judgeError}</span>
        </p>
        <Button variant="outline" size="sm" onClick={live.runJudge}>
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Note>Not judged yet.</Note>
      {live && !live.isStreaming && (
        <Button variant="outline" size="sm" onClick={live.runJudge}>
          Run AI judge
        </Button>
      )}
    </div>
  )
}

function Usage({ response }: { response: RunResponse }) {
  const rows = [
    ['Input tokens', formatTokens(response.inputTokens)],
    ['Output tokens', formatTokens(response.outputTokens)],
    ['Cost', formatCost(response.costUsd)],
    ['Model', getModelLabel(response.model)],
  ]
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={cn('truncate tabular-nums', label !== 'Model' && 'font-mono text-[13px]')}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Side column of the active strategy: the user's rating, the AI judge and token usage. */
export function ResponseDetails(props: ResponseDetailsProps) {
  const { response, editable, judgeModel, identity } = props
  const showRating = editable || response.rating !== null || response.isWinner
  return (
    <aside
      aria-label="Response details"
      className="min-w-0 divide-y divide-border self-start rounded-lg border border-border bg-surface lg:sticky lg:top-20"
    >
      {showRating && (
        <Section title={editable ? 'Your rating' : 'Rating'}>
          <Rating {...props} />
        </Section>
      )}
      <Section title="AI judge" meta={!identity.hidden && getModelLabel(judgeModel)}>
        <Judge {...props} />
      </Section>
      <Section title="Usage">
        <Usage response={response} />
      </Section>
    </aside>
  )
}
