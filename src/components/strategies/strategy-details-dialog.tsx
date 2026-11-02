import { PromptBlock, VARIABLE_HIGHLIGHTS } from '@/components/common/prompt-block'
import { StrategyLabel } from '@/components/common/strategy-visual'
import { Dialog } from '@/components/ui/dialog'
import type { Strategy } from '@/server/strategies'
import { PromptPreview } from './prompt-preview'

/** Read-only view of a strategy's raw template and how it renders. */
export function StrategyDetailsDialog({
  open,
  strategy,
  onOpenChange,
}: {
  open: boolean
  strategy: Strategy | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog
      open={open && strategy !== null}
      onOpenChange={onOpenChange}
      size="2xl"
      title={strategy ? <StrategyLabel name={strategy.name} color={strategy.color} icon={strategy.icon} /> : ''}
      description={strategy?.description}
    >
      {strategy && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Definition</p>
            <PromptBlock
              label="System prompt"
              text={strategy.systemPrompt ?? ''}
              empty="No system prompt."
              highlights={VARIABLE_HIGHLIGHTS}
              maxHeightClassName="max-h-40"
            />
            <PromptBlock label="Template" text={strategy.template} highlights={VARIABLE_HIGHLIGHTS} />
            <p className="text-xs text-muted-foreground">
              Injects <span className="font-mono text-foreground">{strategy.exampleCount}</span>{' '}
              {strategy.exampleCount === 1 ? 'example' : 'examples'}.
            </p>
          </div>
          <div className="lg:border-l lg:border-border lg:pl-6">
            <PromptPreview
              systemPrompt={strategy.systemPrompt ?? ''}
              template={strategy.template}
              exampleCount={strategy.exampleCount}
            />
          </div>
        </div>
      )}
    </Dialog>
  )
}
