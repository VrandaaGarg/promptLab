import { Crown, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import { Tooltip } from '@/components/ui/tooltip'
import { formatCost, formatScore, formatTokens } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { ResponseBody } from './response-body'
import { ResponseName, responseNameText } from './response-name'
import { ResponseStatus } from './response-status'
import type { ResponseIdentity } from './types'

type ResponseGridProps = {
  responses: RunResponse[]
  identityOf: (id: string) => ResponseIdentity
  editable: boolean
  onRate: (responseId: string, rating: number | null) => void
  /** Opens a strategy in the tab view. */
  onOpen: (responseId: string) => void
}

type GridCardProps = Omit<ResponseGridProps, 'responses' | 'identityOf'> & { response: RunResponse; identity: ResponseIdentity }

function GridCard({ response, identity, editable, onRate, onOpen }: GridCardProps) {
  const name = responseNameText(response, identity)
  const score = identity.hidden ? undefined : response.judgeScore?.overall
  const showRating = response.status === 'done' && (editable || response.rating !== null)
  const tokens =
    response.inputTokens === null && response.outputTokens === null
      ? null
      : (response.inputTokens ?? 0) + (response.outputTokens ?? 0)

  return (
    <article
      aria-label={name}
      className={cn('flex min-w-0 flex-col rounded-lg border bg-surface', response.isWinner ? 'border-primary/40' : 'border-border')}
    >
      <button
        type="button"
        onClick={() => onOpen(response.id)}
        className="flex h-11 w-full items-center gap-2.5 rounded-t-lg border-b border-border px-3.5 text-left text-sm transition-colors hover:bg-surface-2/60 focus-visible:outline-offset-[-2px]"
      >
        <ResponseName response={response} identity={identity} className="min-w-0 flex-1 font-medium" />
        <ResponseStatus status={response.status} compact />
        {score !== undefined && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            <span className="sr-only">Judge score </span>
            {formatScore(score)}
          </span>
        )}
        {response.isWinner && (
          <>
            <Crown aria-hidden="true" className="size-3.5 shrink-0 fill-current text-primary" />
            <span className="sr-only">Your pick</span>
          </>
        )}
        <span className="sr-only">, open in tab view</span>
      </button>

      <ResponseBody response={response} compact />

      <footer className="mt-auto flex h-11 items-center gap-3 border-t border-border pl-3.5 pr-1.5">
        {showRating && (
          <StarRating
            size="sm"
            value={response.rating ?? 0}
            readOnly={!editable}
            onChange={(value) => onRate(response.id, value === response.rating ? null : value)}
            aria-label={`Your rating for ${name}`}
          />
        )}
        {tokens !== null && (
          <span className="ml-auto truncate font-mono text-xs tabular-nums text-muted-foreground">
            {formatTokens(tokens)} tok · {formatCost(response.costUsd)}
          </span>
        )}
        <Tooltip content="Expand" align="end" className={cn(tokens === null && 'ml-auto')}>
          <Button variant="ghost" size="icon-sm" aria-label={`Open ${name} in tab view`} onClick={() => onOpen(response.id)}>
            <Maximize2 className="size-3.5 text-muted-foreground" />
          </Button>
        </Tooltip>
      </footer>
    </article>
  )
}

/** Every strategy side by side, streaming in parallel. */
export function ResponseGrid({ responses, identityOf, ...props }: ResponseGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-3">
      {responses.map((response) => (
        <GridCard key={response.id} response={response} identity={identityOf(response.id)} {...props} />
      ))}
    </div>
  )
}
