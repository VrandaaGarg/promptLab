import ReactMarkdown, { type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
export type MarkdownProps = Omit<Options, 'children'> & { children: string; streaming?: boolean; className?: string }
export function Markdown({ children, streaming = false, className, remarkPlugins, ...props }: MarkdownProps) { return <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}><ReactMarkdown remarkPlugins={[remarkGfm, ...(remarkPlugins ?? [])]} {...props}>{children}</ReactMarkdown>{streaming && <span className="streaming-caret" aria-hidden="true" />}</div> }
