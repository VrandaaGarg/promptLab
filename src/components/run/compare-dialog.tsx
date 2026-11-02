import { diffWords } from 'diff'
import { ArrowLeftRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import type { RunResponse } from '@/server/runs'
import { ResponseName } from './response-name'
import type { ResponseIdentity } from './types'

type CompareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  responses: RunResponse[]
  identityOf: (id: string) => ResponseIdentity
}

function DiffView({ before, after }: { before: string; after: string }) {
  const parts = useMemo(() => diffWords(before, after), [before, after])
  const stats = parts.reduce(
    (acc, p) => {
      const words = p.value.trim() ? p.value.trim().split(/\s+/).length : 0
      if (p.added) acc.added += words
      else if (p.removed) acc.removed += words
      else acc.same += words
      return acc
    },
    { added: 0, removed: 0, same: 0 },
  )
  const total = stats.added + stats.removed + stats.same
  const overlap = total ? Math.round((stats.same / total) * 100) : 100

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-destructive/20" />
          Only in A <span className="font-mono tabular-nums">({stats.removed})</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-success/25" />
          Only in B <span className="font-mono tabular-nums">({stats.added})</span>
        </span>
        <span className="sm:ml-auto">
          <span className="font-mono tabular-nums text-foreground">{overlap}%</span> shared wording
        </span>
      </div>
      <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed">
        {parts.map((part, i) =>
          part.added ? (
            <ins key={i} className="rounded-[3px] bg-success/20 text-foreground no-underline">
              {part.value}
            </ins>
          ) : part.removed ? (
            <del key={i} className="rounded-[3px] bg-destructive/15 text-muted-foreground decoration-destructive/50">
              {part.value}
            </del>
          ) : (
            <span key={i}>{part.value}</span>
          ),
        )}
      </div>
    </div>
  )
}

/** Word-level diff between two completed responses. */
export function CompareDialog({ open, onOpenChange, responses, identityOf }: CompareDialogProps) {
  const candidates = responses.filter((r) => r.status === 'done' && r.output)
  const [leftId, setLeftId] = useState<string | undefined>(undefined)
  const [rightId, setRightId] = useState<string | undefined>(undefined)
  const left = candidates.find((r) => r.id === leftId) ?? candidates[0]
  const right = candidates.find((r) => r.id === rightId) ?? candidates.find((r) => r.id !== left?.id)

  const options = [{ options: candidates.map((r) => ({ value: r.id, content: <ResponseName response={r} identity={identityOf(r.id)} /> })) }]
  const picker = (side: 'A' | 'B', value: RunResponse, onChange: (id: string) => void) => (
    <div className="min-w-0 flex-1 space-y-1.5">
      <span aria-hidden="true" className="block text-xs font-medium text-muted-foreground">
        {side}
      </span>
      <DropdownSelect
        variant="field"
        label={`Response ${side}`}
        groups={options}
        isSelected={(id) => id === value.id}
        onSelect={onChange}
        trigger={<ResponseName response={value} identity={identityOf(value.id)} />}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="xl" title="Compare responses" description="Word-level differences between two outputs.">
      {left && right ? (
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            {picker('A', left, setLeftId)}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Swap A and B"
              onClick={() => {
                setLeftId(right.id)
                setRightId(left.id)
              }}
            >
              <ArrowLeftRight className="size-4" />
            </Button>
            {picker('B', right, setRightId)}
          </div>
          <DiffView before={left.output} after={right.output} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">At least two completed responses are needed to compare.</p>
      )}
    </Dialog>
  )
}
