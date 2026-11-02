import type { ReactNode } from 'react'
import { CopyButton } from '@/components/ui/copy-button'
import { TEMPLATE_VARIABLES } from '@/lib/domain'
import { cn } from '@/lib/utils'

export type HighlightTone = 'examples' | 'role' | 'variable'
export type Highlight = { text: string; tone: HighlightTone }

const toneClasses: Record<HighlightTone, string> = {
  examples: 'bg-accent text-foreground',
  role: 'bg-warning/15 text-foreground',
  variable: 'bg-surface-2 font-medium text-primary',
}

const HIGHLIGHT_LABELS: Record<HighlightTone, string> = {
  examples: 'Injected examples',
  role: 'Generated role',
  variable: 'Template variable',
}

/** Highlights `{{task}}`, `{{examples}}` and `{{role}}` in raw templates. */
export const VARIABLE_HIGHLIGHTS: Highlight[] = Object.values(TEMPLATE_VARIABLES).map((text) => ({ text, tone: 'variable' }))

type Range = { start: number; end: number; tone: HighlightTone }

/** Non-overlapping ranges of every needle occurrence, earliest first. */
function findRanges(text: string, highlights: Highlight[]): Range[] {
  const ranges: Range[] = []
  for (const { text: needle, tone } of highlights) {
    const trimmed = needle.trim()
    if (trimmed.length < 2) continue
    let from = 0
    for (;;) {
      const start = text.indexOf(trimmed, from)
      if (start === -1) break
      ranges.push({ start, end: start + trimmed.length, tone })
      from = start + trimmed.length
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged: Range[] = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (!last || range.start >= last.end) merged.push(range)
  }
  return merged
}

export function HighlightedText({ text, highlights = [] }: { text: string; highlights?: Highlight[] }) {
  const ranges = findRanges(text, highlights)
  if (ranges.length === 0) return <>{text}</>
  const parts: ReactNode[] = []
  let cursor = 0
  ranges.forEach((range, i) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start))
    parts.push(
      <mark key={i} className={cn('rounded-[3px] px-0.5', toneClasses[range.tone])}>
        {text.slice(range.start, range.end)}
      </mark>,
    )
    cursor = range.end
  })
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <>{parts}</>
}

export function HighlightLegend({ tones }: { tones: HighlightTone[] }) {
  if (tones.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {tones.map((tone) => (
        <span key={tone} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={cn('size-2.5 rounded-sm', toneClasses[tone])} />
          {HIGHLIGHT_LABELS[tone]}
        </span>
      ))}
    </div>
  )
}

export type PromptBlockProps = {
  label: ReactNode
  text: string
  highlights?: Highlight[]
  empty?: ReactNode
  className?: string
  maxHeightClassName?: string
}

/** A labelled, copyable monospace block showing an exact prompt. */
export function PromptBlock({
  label,
  text,
  highlights,
  empty = 'None',
  className,
  maxHeightClassName = 'max-h-72',
}: PromptBlockProps) {
  return (
    <section className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <header className="flex h-9 items-center justify-between gap-2 border-b border-border bg-surface-2 pl-3 pr-1">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        {text && <CopyButton text={text} size="icon-sm" className="size-7" />}
      </header>
      {text ? (
        <pre
          className={cn(
            'overflow-auto whitespace-pre-wrap break-words bg-surface p-3 font-mono text-xs leading-relaxed text-foreground',
            maxHeightClassName,
          )}
        >
          <HighlightedText text={text} highlights={highlights} />
        </pre>
      ) : (
        <p className="bg-surface p-3 text-xs italic text-muted-foreground">{empty}</p>
      )}
    </section>
  )
}
