import { Eye, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { StrategyIcon, strategyColor } from '@/components/common/strategy-visual'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { fadeUp } from '@/lib/motion'
import type { Strategy } from '@/server/strategies'

export function StrategyCard({
  strategy,
  onView,
  onEdit,
  onDelete,
}: {
  strategy: Strategy
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const builtIn = strategy.userId === null
  const color = strategyColor(strategy.color)

  return (
    <motion.article
      layout="position"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col rounded-lg border border-border bg-surface p-5"
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md"
          style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          <StrategyIcon icon={strategy.icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{strategy.name}</h3>
            {builtIn ? <Badge>Built-in</Badge> : <Badge variant="primary">Custom</Badge>}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{strategy.description || 'No description.'}</p>
        </div>
      </header>

      <pre className="mt-4 line-clamp-3 flex-1 whitespace-pre-wrap break-words rounded-md bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {strategy.template}
      </pre>

      <footer className="mt-4 flex items-center justify-between gap-2">
        <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>
            <span className="font-mono text-foreground">{strategy.exampleCount}</span>{' '}
            {strategy.exampleCount === 1 ? 'example' : 'examples'}
          </span>
          {strategy.systemPrompt && <span>System prompt</span>}
        </p>
        <div className="flex items-center gap-0.5">
          {builtIn ? (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="size-3.5" />
              View
            </Button>
          ) : (
            <>
              <Tooltip content="Preview">
                <Button variant="ghost" size="icon-sm" aria-label={`Preview ${strategy.name}`} onClick={onView}>
                  <Eye className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Edit">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${strategy.name}`} onClick={onEdit}>
                  <Pencil className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${strategy.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </footer>
    </motion.article>
  )
}
