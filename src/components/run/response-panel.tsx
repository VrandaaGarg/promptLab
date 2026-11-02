import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { CopyButton } from '@/components/ui/copy-button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { RunResponse } from '@/server/runs'
import { ResponseBody } from './response-body'
import { ResponseDetails } from './response-details'
import { ResponseHeading } from './response-name'
import { ResponseExamples, ResponsePersona, ResponsePrompt } from './response-sections'
import { ResponseStatus } from './response-status'
import type { ResponseIdentity, RunLiveState } from './types'

export type PanelSection = 'response' | 'examples' | 'persona' | 'prompt'

type ResponsePanelProps = {
  response: RunResponse
  identity: ResponseIdentity
  judgeModel: string
  editable: boolean
  live?: RunLiveState
  /** Preferred section; falls back to the response when this strategy doesn't have it. */
  section: PanelSection
  onSectionChange: (section: PanelSection) => void
  onRate: (rating: number | null) => void
  onToggleWinner: (isWinner: boolean) => void
}

/** Sections that apply to a strategy. Blind mode keeps only the answer, since the rest reveals the strategy. */
function sectionsFor(response: RunResponse, hidden: boolean) {
  const sections: { value: PanelSection; label: ReactNode }[] = [{ value: 'response', label: 'Response' }]
  if (hidden) return sections
  if (response.examples.length > 0) {
    sections.push({
      value: 'examples',
      label: (
        <span className="inline-flex items-center gap-1.5">
          Examples <span className="font-mono text-[11px] tabular-nums opacity-70">{response.examples.length}</span>
        </span>
      ),
    })
  }
  if (response.systemPrompt?.trim()) sections.push({ value: 'persona', label: 'Persona' })
  sections.push({ value: 'prompt', label: 'Prompt' })
  return sections
}

/** The active strategy: its answer and strategy details, beside rating, judge and usage. */
export function ResponsePanel({ section, onSectionChange, ...props }: ResponsePanelProps) {
  const { response, identity } = props
  const sections = sectionsFor(response, identity.hidden)
  const current = sections.some((s) => s.value === section) ? section : 'response'

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-label="Strategy output" className="min-w-0 rounded-lg border border-border bg-surface">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-4 py-3 sm:px-5">
          <ResponseHeading response={response} identity={identity} />
          {sections.length > 1 && (
            <div className="order-last w-full overflow-x-auto scrollbar-none sm:order-none sm:w-auto">
              <SegmentedControl
                aria-label="Strategy details"
                value={current}
                onValueChange={(value) => onSectionChange(sections.find((s) => s.value === value)?.value ?? 'response')}
                options={sections}
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {response.status !== 'done' && <ResponseStatus status={response.status} />}
            {response.output && <CopyButton text={response.output} className="size-8" />}
          </div>
        </header>

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {current === 'examples' ? (
            <ResponseExamples examples={response.examples} />
          ) : current === 'persona' ? (
            <ResponsePersona systemPrompt={response.systemPrompt ?? ''} />
          ) : current === 'prompt' ? (
            <ResponsePrompt response={response} />
          ) : (
            <ResponseBody response={response} />
          )}
        </motion.div>
      </section>

      <ResponseDetails {...props} />
    </div>
  )
}
