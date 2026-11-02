import { HighlightLegend, PromptBlock, type Highlight } from '@/components/common/prompt-block'
import { StrategyLabel } from '@/components/common/strategy-visual'
import { Dialog } from '@/components/ui/dialog'
import type { Example } from '@/lib/domain'
import { getModelLabel } from '@/lib/models'
import type { RunResponse } from '@/server/runs'

function examplesToHighlights(examples: Example[]): Highlight[] {
  return examples.flatMap((e) => [
    { text: e.input, tone: 'examples' as const },
    { text: e.output, tone: 'examples' as const },
  ])
}

export function PromptInspectorDialog({
  open,
  onOpenChange,
  response,
  examples,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  response: RunResponse
  examples: Example[]
}) {
  const highlights = examplesToHighlights(examples)
  const fullPrompt = `${response.systemPrompt ?? ''}\n${response.userPrompt}`
  const usesExamples = highlights.some((h) => h.text.trim() && fullPrompt.includes(h.text.trim()))

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="Prompt inspector"
      description={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <StrategyLabel name={response.strategyName} color={response.color} icon={response.icon} className="text-foreground" />
          <span aria-hidden="true">·</span>
          <span>Exactly what was sent to {getModelLabel(response.model)}</span>
        </span>
      }
    >
      <div className="space-y-4">
        <HighlightLegend tones={usesExamples ? ['examples'] : []} />
        <PromptBlock
          label="System prompt"
          text={response.systemPrompt ?? ''}
          empty="No system prompt. The model's defaults apply."
          highlights={highlights}
        />
        <PromptBlock label="User prompt" text={response.userPrompt} highlights={highlights} maxHeightClassName="max-h-[45vh]" />
      </div>
    </Dialog>
  )
}
