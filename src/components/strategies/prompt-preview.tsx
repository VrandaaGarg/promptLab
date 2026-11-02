import { HighlightLegend, PromptBlock, type HighlightTone } from '@/components/common/prompt-block'
import { renderStrategyPrompt } from '@/lib/strategies'
import { SAMPLE_CONTEXT, SAMPLE_HIGHLIGHTS } from './sample-context'

/** Renders a strategy against a fixed sample task, exactly as it would be sent. */
export function PromptPreview({
  systemPrompt,
  template,
  exampleCount,
}: {
  systemPrompt: string
  template: string
  exampleCount: number
}) {
  const rendered = renderStrategyPrompt({ systemPrompt, template, exampleCount }, SAMPLE_CONTEXT)
  const all = `${rendered.systemPrompt ?? ''}\n${rendered.userPrompt}`
  const tones: HighlightTone[] = []
  if (exampleCount > 0 && /\{\{examples\}\}/.test(`${systemPrompt}${template}`)) tones.push('examples')
  if (all.includes(SAMPLE_CONTEXT.role)) tones.push('role')

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live preview</p>
        <p className="text-xs text-muted-foreground">
          Sample task: <span className="text-foreground">{SAMPLE_CONTEXT.task}</span>
        </p>
      </div>
      <HighlightLegend tones={tones} />
      {rendered.systemPrompt && (
        <PromptBlock label="System prompt" text={rendered.systemPrompt} highlights={SAMPLE_HIGHLIGHTS} maxHeightClassName="max-h-40" />
      )}
      <PromptBlock
        label="User prompt"
        text={rendered.userPrompt.trim()}
        empty="Write a template to see the rendered prompt."
        highlights={SAMPLE_HIGHLIGHTS}
        maxHeightClassName="max-h-[22rem]"
      />
    </div>
  )
}
