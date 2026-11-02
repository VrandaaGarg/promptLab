import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { chipClassName } from './toggle-chip'

type DropdownOption<T extends string> = { value: T; content: ReactNode; disabled?: boolean }
type DropdownGroup<T extends string> = { label?: string; options: DropdownOption<T>[] }

export type DropdownSelectProps<T extends string> = {
  /** Accessible name of the control, e.g. "Model". */
  label: string
  /** Visible trigger content; a chevron is appended. */
  trigger: ReactNode
  groups: DropdownGroup<T>[]
  isSelected: (value: T) => boolean
  /** Single-select closes after choosing; multi-select toggles and stays open. */
  onSelect: (value: T) => void
  multiple?: boolean
  header?: ReactNode
  footer?: ReactNode
  disabled?: boolean
  /** `pill`: compact toolbar chip. `field`: full-width form control, like an input. */
  variant?: 'pill' | 'field'
  className?: string
  panelClassName?: string
}

const VIEWPORT_MARGIN = 8
const GAP = 6

/** Listbox dropdown with checkbox indicators, grouping, full keyboard support and viewport-aware placement. */
export function DropdownSelect<T extends string>({
  label,
  trigger,
  groups,
  isSelected,
  onSelect,
  multiple = false,
  header,
  footer,
  disabled,
  variant = 'pill',
  className,
  panelClassName,
}: DropdownSelectProps<T>) {
  const [openState, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [placement, setPlacement] = useState({ top: 0, left: 0, minWidth: 0, above: false })
  const root = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const listbox = useRef<HTMLDivElement>(null)
  const id = useId()
  const open = openState && !disabled
  const options = groups.flatMap((g) => g.options)
  const enabled = options.flatMap((o, i) => (o.disabled ? [] : [i]))
  const optionId = (i: number) => `${id}-option-${i}`
  const inside = (node: EventTarget | null) =>
    node instanceof Node && Boolean(root.current?.contains(node) || panel.current?.contains(node))

  const show = () => {
    const selected = enabled.find((i) => options[i] && isSelected(options[i].value))
    setActive(selected ?? enabled[0] ?? -1)
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }
  const choose = (i: number) => {
    const option = options[i]
    if (!option || option.disabled) return
    onSelect(option.value)
    if (!multiple) close()
  }

  useEffect(() => {
    if (!open) return
    listbox.current?.focus({ preventScroll: true })
    // Capture phase, so a host (e.g. a Dialog) never sees the gesture that dismisses this dropdown:
    // Escape closes only the dropdown, and an outside press suppresses the follow-up mousedown.
    const onPointerDown = (event: PointerEvent) => {
      if (inside(event.target)) return
      event.preventDefault()
      setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  // Portaled and fixed, so no ancestor overflow or stacking context clips it. Stays in the viewport:
  // shifts horizontally, flips above when there's no room below.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const t = triggerRef.current?.getBoundingClientRect()
      const el = panel.current
      if (!t || !el) return
      const width = Math.max(el.offsetWidth, t.width)
      const left = Math.max(VIEWPORT_MARGIN, Math.min(t.left, window.innerWidth - VIEWPORT_MARGIN - width))
      const above = t.bottom + el.offsetHeight + VIEWPORT_MARGIN > window.innerHeight && t.top > el.offsetHeight + VIEWPORT_MARGIN
      setPlacement({ top: above ? t.top - el.offsetHeight - GAP : t.bottom + GAP, left, minWidth: t.width, above })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  // Keep the active option scrolled into view inside the list.
  useEffect(() => {
    const list = listbox.current
    const el = open && active >= 0 ? document.getElementById(`${id}-option-${active}`) : null
    if (!list || !el) return
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight
  }, [open, active, id])

  const onListKeyDown = (event: KeyboardEvent) => {
    const pos = enabled.indexOf(active)
    const keys: Record<string, (() => void) | undefined> = {
      ArrowDown: () => setActive(enabled[Math.min(pos + 1, enabled.length - 1)] ?? -1),
      ArrowUp: () => setActive(enabled[Math.max(pos - 1, 0)] ?? -1),
      Home: () => setActive(enabled[0] ?? -1),
      End: () => setActive(enabled.at(-1) ?? -1),
      Enter: event.metaKey || event.ctrlKey ? undefined : () => choose(active),
      ' ': () => choose(active),
    }
    const handler = keys[event.key]
    if (!handler) return
    event.preventDefault()
    handler()
  }

  return (
    <div
      ref={root}
      className={cn(variant === 'field' ? 'flex min-w-0' : 'inline-flex', className)}
      onBlur={(event) => {
        if (event.relatedTarget && !inside(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          show()
        }}
        className={
          variant === 'field'
            ? cn(
                'flex h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-surface pl-3 pr-2.5 text-left text-sm text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0',
                open ? 'border-border-strong' : 'border-input',
              )
            : chipClassName({ className: cn('min-w-0 pr-2.5', open && 'border-border-strong bg-surface-2') })
        }
      >
        <span className="sr-only">{label}: </span>
        {trigger}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'text-muted-foreground transition-transform duration-200',
            variant === 'field' ? 'ml-auto size-4' : 'size-3.5',
            open && 'rotate-180',
          )}
        />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panel}
                initial={{ opacity: 0, y: placement.above ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: placement.above ? 4 : -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ top: placement.top, left: placement.left, minWidth: placement.minWidth }}
                // Keep focus on the listbox while clicking inside the panel; clicks still fire.
                onMouseDown={(event) => event.preventDefault()}
                className={cn(
                  'fixed z-[60] flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface text-sm text-foreground',
                  panelClassName,
                )}
              >
                {header}
                <div
                  ref={listbox}
                  id={`${id}-listbox`}
                  role="listbox"
                  tabIndex={0}
                  aria-label={label}
                  aria-multiselectable={multiple || undefined}
                  aria-activedescendant={active >= 0 ? optionId(active) : undefined}
                  onKeyDown={onListKeyDown}
                  className="relative max-h-[min(20rem,55vh)] overflow-y-auto overscroll-contain p-1.5 outline-none"
                >
                  {groups.map((group, g) => {
                    const offset = groups.slice(0, g).reduce((n, prev) => n + prev.options.length, 0)
                    return (
                      <div key={g} role="group" aria-labelledby={group.label && `${id}-group-${g}`} className="not-first:mt-1.5">
                        {group.label && (
                          <div
                            id={`${id}-group-${g}`}
                            className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                          >
                            {group.label}
                          </div>
                        )}
                        {group.options.map((option, j) => {
                          const i = offset + j
                          const selected = isSelected(option.value)
                          return (
                            <div
                              key={option.value}
                              id={optionId(i)}
                              role="option"
                              aria-selected={selected}
                              aria-disabled={option.disabled || undefined}
                              onClick={() => choose(i)}
                              onPointerMove={() => !option.disabled && i !== active && setActive(i)}
                              className={cn(
                                'flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors',
                                option.disabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer',
                                i === active && 'bg-surface-2',
                              )}
                            >
                              <Checkbox checked={selected} disabled={option.disabled} className="mt-0.5" />
                              <div className={cn('min-w-0 flex-1', option.disabled && 'opacity-60')}>{option.content}</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                {footer}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
