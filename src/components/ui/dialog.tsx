import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from './button'
export type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' }
const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-5xl' }
const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: DialogProps) {
  const [mounted, setMounted] = useState(false); const panel = useRef<HTMLDivElement>(null); const titleId = useId(); const descriptionId = useId(); const onChange = useRef(onOpenChange); onChange.current = onOpenChange
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!open || !mounted) return
    const previous = document.activeElement as HTMLElement | null; const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => { const first = panel.current?.querySelector<HTMLElement>(focusable); (first ?? panel.current)?.focus() })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onChange.current(false); return }
      if (event.key !== 'Tab' || !panel.current) return
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(focusable)).filter(el => el.getClientRects().length > 0)
      if (!items.length) { event.preventDefault(); panel.current.focus(); return }
      const first = items[0]!; const last = items[items.length - 1]!
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown); return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = oldOverflow; previous?.focus() }
  }, [open, mounted])
  if (!mounted) return null
  return createPortal(<AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onOpenChange(false) }}><motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: 'easeOut' }} className={cn('relative my-auto w-full rounded-xl border border-border bg-surface p-5 outline-none', sizes[size])}><div className="flex items-start justify-between gap-4"><div><h2 id={titleId} className="text-base font-semibold">{title}</h2>{description && <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">{description}</p>}</div><Button variant="ghost" size="icon-sm" aria-label="Close dialog" onClick={() => onOpenChange(false)}><X className="size-4" /></Button></div><div className="mt-5">{children}</div>{footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}</motion.div></motion.div>}</AnimatePresence>, document.body)
}
