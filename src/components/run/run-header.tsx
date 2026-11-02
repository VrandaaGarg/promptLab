import { EyeOff } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CategoryBadge } from '@/components/common/category-badge'
import { ModelBadge } from '@/components/common/model-badge'
import { RelativeTime } from '@/components/common/relative-time'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RunViewData } from './types'

const CLAMP_THRESHOLD = 280

export function RunHeader({ run, actions }: { run: RunViewData; actions?: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const long = run.task.length > CLAMP_THRESHOLD || run.task.split('\n').length > 4

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Task</p>
        <p
          className={cn(
            'mt-1.5 whitespace-pre-wrap break-words text-base leading-relaxed text-foreground',
            long && !expanded && 'line-clamp-3',
          )}
        >
          {run.task}
        </p>
        {long && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {expanded ? 'Show less' : 'Show full task'}
          </button>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <ModelBadge model={run.model} />
          <CategoryBadge category={run.category} />
          {run.blindMode && (
            <Badge>
              <EyeOff aria-hidden="true" className="size-3" />
              Blind
            </Badge>
          )}
          <RelativeTime date={run.createdAt} className="ml-1" />
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  )
}
