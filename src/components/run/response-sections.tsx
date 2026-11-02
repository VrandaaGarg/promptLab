import type { ReactNode } from 'react'
import { HighlightLegend, PromptBlock, type Highlight } from '@/components/common/prompt-block'
import { Markdown } from '@/components/ui/markdown'
import type { Example } from '@/lib/domain'
import { getModelLabel } from '@/lib/models'
import type { RunResponse } from '@/server/runs'

function SectionIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="mt-0.5 text-xs text-muted-foreground">{children}</p>
    </div>
  )
}

/** The worked examples this strategy injected, as numbered input → output pairs. */
export function ResponseExamples({ examples }: { examples: Example[] }) {
  return (
    <div className="p-4 sm:p-6">
      <SectionIntro title={`${examples.length} ${examples.length === 1 ? 'example' : 'examples'}`}>
        Examples injected into this prompt, in order.
      </SectionIntro>
      <ol className="max-w-[75ch] divide-y divide-border">
        {examples.map((example, i) => (
          <li key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-5 first:pt-0 last:pb-0">
            <span aria-hidden="true" className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Input</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{example.input}</p>
              </div>
              <div className="rounded-md bg-surface-2 px-3.5 py-3">
                <p className="text-xs font-medium text-muted-foreground">Output</p>
                <Markdown className="mt-1 leading-relaxed">{example.output}</Markdown>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The system prompt, which for role-based strategies carries the generated expert persona. */
export function ResponsePersona({ systemPrompt }: { systemPrompt: string }) {
  return (
    <div className="p-4 sm:p-6">
      <SectionIntro title="Persona">System prompt the model answered as.</SectionIntro>
      <div className="max-w-[75ch] border-l-2 border-primary/50 pl-4">
        <Markdown className="leading-7 sm:prose-base">{systemPrompt}</Markdown>
      </div>
    </div>
  )
}

const exampleHighlights = (examples: Example[]): Highlight[] =>
  examples.flatMap((e) => [
    { text: e.input, tone: 'examples' as const },
    { text: e.output, tone: 'examples' as const },
  ])

/** Exactly what was sent to the model. */
export function ResponsePrompt({ response }: { response: RunResponse }) {
  const highlights = exampleHighlights(response.examples)
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <SectionIntro title="Prompt">Exactly what was sent to {getModelLabel(response.model)}.</SectionIntro>
      <HighlightLegend tones={highlights.length ? ['examples'] : []} />
      <PromptBlock
        label="System prompt"
        text={response.systemPrompt ?? ''}
        empty="No system prompt. The model's defaults apply."
        highlights={highlights}
      />
      <PromptBlock label="User prompt" text={response.userPrompt} highlights={highlights} maxHeightClassName="max-h-[50vh]" />
    </div>
  )
}
