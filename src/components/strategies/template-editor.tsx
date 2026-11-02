import { Plus } from 'lucide-react'
import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { TEMPLATE_VARIABLES } from '@/lib/domain'
import { cn } from '@/lib/utils'

const VARIABLE_HINTS: Record<keyof typeof TEMPLATE_VARIABLES, string> = {
  task: "The user's task (required)",
  examples: 'Worked examples, as many as the example count',
  role: 'An expert persona generated for the task',
}

export type TemplateEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  rows?: number
  placeholder?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  className?: string
}

/** Monospace prompt editor with chips that insert template variables at the cursor. */
export function TemplateEditor({ value, onChange, rows = 6, className, ...props }: TemplateEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  /** Last caret position; null until the user has placed one, in which case tokens are appended. */
  const caret = useRef<{ start: number; end: number } | null>(null)

  const insert = (token: string) => {
    const { start, end } = caret.current ?? { start: value.length, end: value.length }
    const separator = caret.current || !value || value.endsWith('\n') ? '' : '\n\n'
    const inserted = separator + token
    onChange(value.slice(0, start) + inserted + value.slice(end))
    const next = start + inserted.length
    caret.current = { start: next, end: next }
    requestAnimationFrame(() => {
      ref.current?.focus()
      ref.current?.setSelectionRange(next, next)
    })
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-input bg-surface has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-ring', className)}>
      <Textarea
        ref={ref}
        autosize
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={(e) => {
          caret.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }
        }}
        spellCheck={false}
        className="rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:outline-none"
        {...props}
      />
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-surface-2/60 px-2 py-1.5">
        <span className="mr-1 text-[11px] text-muted-foreground">Insert</span>
        {(Object.keys(TEMPLATE_VARIABLES) as Array<keyof typeof TEMPLATE_VARIABLES>).map((key) => (
          <button
            key={key}
            type="button"
            title={VARIABLE_HINTS[key]}
            onClick={() => insert(TEMPLATE_VARIABLES[key])}
            className="inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-primary transition-colors hover:border-border-strong hover:bg-accent"
          >
            <Plus aria-hidden="true" className="size-3" />
            {TEMPLATE_VARIABLES[key]}
          </button>
        ))}
      </div>
    </div>
  )
}
