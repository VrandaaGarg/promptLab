import ReactMarkdown, { type Options } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { normalizeMath } from '@/lib/markdown'
import { cn } from '@/lib/utils'

type Plugins = NonNullable<Options['remarkPlugins']>

export type MarkdownProps = Omit<Options, 'children'> & { children: string; streaming?: boolean; className?: string }

// Single dollars stay text so prices aren't typeset; normalizeMath maps LaTeX delimiters to `$$`.
const REMARK: Plugins = [remarkGfm, [remarkMath, { singleDollarTextMath: false }]]
// Partial formulas mid-stream render muted instead of throwing.
const REHYPE: Plugins = [[rehypeKatex, { throwOnError: false, errorColor: 'var(--muted-foreground)', strict: false }]]

export function Markdown({ children, streaming = false, className, remarkPlugins, rehypePlugins, ...props }: MarkdownProps) {
  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={[...REMARK, ...(remarkPlugins ?? [])]}
        rehypePlugins={[...REHYPE, ...(rehypePlugins ?? [])]}
        {...props}
      >
        {normalizeMath(children)}
      </ReactMarkdown>
      {streaming && <span className="streaming-caret" aria-hidden="true" />}
    </div>
  )
}
