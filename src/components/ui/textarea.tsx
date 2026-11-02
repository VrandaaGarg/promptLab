import { useLayoutEffect, useRef, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export type TextareaProps = ComponentProps<'textarea'> & { autosize?: boolean }
export function Textarea({ className, autosize = false, onChange, ref, value, defaultValue, ...props }: TextareaProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null)
  const resize = () => { const el = localRef.current; if (autosize && el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` } }
  useLayoutEffect(() => { resize() }, [value, autosize])
  return <textarea ref={(node) => { localRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node }} value={value} defaultValue={defaultValue} onChange={(event) => { resize(); onChange?.(event) }} className={cn('min-h-20 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', autosize && 'resize-none overflow-hidden', className)} {...props} />
}
