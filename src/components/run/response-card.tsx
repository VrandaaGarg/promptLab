import { Crown, FileSearch } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { strategyColor } from '@/components/common/strategy-visual'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { StarRating } from '@/components/ui/star-rating'
import { Tooltip } from '@/components/ui/tooltip'
import type { Example } from '@/lib/domain'
import { formatCost, formatTokens } from '@/lib/format'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { JudgeScorePill } from './judge-score-pill'
import { PromptInspectorDialog } from './prompt-inspector-dialog'
import { ResponseBody } from './response-body'
import { ResponseHeading, responseNameText } from './response-name'
import { ResponseStatus } from './response-status'
import type { ResponseIdentity } from './types'

export type ResponseCardProps = {
  response: RunResponse
  identity: ResponseIdentity
  examples: Example[]
  judgeModel: string
  editable: boolean
  onRate?: (rating: number | null) => void
  onToggleWinner?: (isWinner: boolean) => void
}

function WinnerToggle({ isWinner, editable, onToggle }: { isWinner: boolean; editable: boolean; onToggle?: (v: boolean) => void }) {
  const badge = 'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium'
  if (!editable) {
    return isWinner ? (
      <span className={cn(badge, 'bg-accent text-primary')}>
        <Crown aria-hidden="true" className="size-3.5" />
        Best
      </span>
    ) : null
  }
  const button = (
    <button
      type="button"
      aria-pressed={isWinner}
      aria-label={isWinner ? 'Best response. Click to unmark' : 'Mark as best response'}
      onClick={() => onToggle?.(!isWinner)}
      className={cn(
        badge,
        'transition-colors',
        isWinner ? 'bg-accent text-primary hover:bg-accent/70' : 'w-7 justify-center px-0 text-muted-foreground hover:bg-surface-2 hover:text-foreground',
      )}
    >
      <Crown aria-hidden="true" className={cn('size-3.5', isWinner && 'fill-current')} />
      {isWinner && 'Best'}
    </button>
  )
  return isWinner ? button : <Tooltip content="Mark as best">{button}</Tooltip>
}

export function ResponseCard({ response, identity, examples, judgeModel, editable, onRate, onToggleWinner }: ResponseCardProps) {
  const [inspecting, setInspecting] = useState(false)
  const done = response.status === 'done'
  const name = responseNameText(response, identity)
  const hasTokens = response.inputTokens !== null || response.outputTokens !== null

  return (
    <motion.article
      layout="position"
      variants={fadeUp}
      aria-label={name}
      className="flex min-w-0 flex-col rounded-lg border border-t-2 border-border bg-surface transition-colors duration-300"
      style={{ borderTopColor: identity.hidden ? 'var(--border-strong)' : strategyColor(response.color) }}
    >
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-3.5">
        <ResponseHeading response={response} identity={identity} />
        <ResponseStatus status={response.status} />
      </header>

      <ResponseBody response={response} />

      <footer className="space-y-2 border-t border-border px-4 py-3">
        <div className="flex min-h-7 items-center justify-between gap-2">
          {done && (editable || response.rating !== null) ? (
            <StarRating
              size="sm"
              value={response.rating ?? 0}
              readOnly={!editable}
              onChange={(value) => onRate?.(value === response.rating ? null : value)}
              aria-label={`Your rating for ${name}`}
            />
          ) : (
            <span className="text-xs text-muted-foreground">{done ? 'Not rated' : ''}</span>
          )}
          {response.judgeScore && !identity.hidden && <JudgeScorePill score={response.judgeScore} judgeModel={judgeModel} />}
        </div>

        <div className="flex items-center gap-1">
          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground tabular-nums">
            {hasTokens && (
              <span title="Input / output tokens">
                {formatTokens(response.inputTokens)}/{formatTokens(response.outputTokens)} tok
                <span aria-hidden="true"> · </span>
              </span>
            )}
            <span title="Estimated cost">{formatCost(response.costUsd)}</span>
          </p>
          {done && <WinnerToggle isWinner={response.isWinner} editable={editable} onToggle={onToggleWinner} />}
          {!identity.hidden && (
            <Tooltip content="View prompt">
              <Button variant="ghost" size="icon-sm" className="size-7" aria-label="View prompt" onClick={() => setInspecting(true)}>
                <FileSearch className="size-3.5" />
              </Button>
            </Tooltip>
          )}
          {response.output && <CopyButton text={response.output} className="size-7 [&_svg]:size-3.5" />}
        </div>
      </footer>

      {!identity.hidden && (
        <PromptInspectorDialog open={inspecting} onOpenChange={setInspecting} response={response} examples={examples} />
      )}
    </motion.article>
  )
}
