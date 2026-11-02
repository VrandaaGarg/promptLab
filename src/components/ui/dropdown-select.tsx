import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { chipClassName } from './toggle-chip'

type DropdownOption<T extends string> = { value: T; content: ReactNode; disabled?: boolean }
type DropdownGroup<T extends string> = { label: string; options: DropdownOption<T>[] }

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
  className?: string
}

const VIEWPORT_MARGIN = 8

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
  className,
}: DropdownSelectProps<T>) {
  const [openState, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [placement, setPlacement] = useState({ x: 0, above: false })
  const root = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const listbox = useRef<HTMLDivElement>(null)
  const id = useId()
  const open = openState && !disabled
  const options = groups.flatMap((g) => g.options)
  const enabled = options.flatMap((o, i) => (o.disabled ? [] : [i]))
  const optionId = (i: number) => `${id}-option-${i}`

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
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the panel inside the viewport: shift horizontally, flip above when there's no room below.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const t = triggerRef.current?.getBoundingClientRect()
      const el = panel.current
      if (!t || !el) return
      const overflowRight = t.left + el.offsetWidth - (window.innerWidth - VIEWPORT_MARGIN)
      const x = Math.max(VIEWPORT_MARGIN - t.left, -Math.max(0, overflowRight))
      const above = t.bottom + el.offsetHeight + VIEWPORT_MARGIN > window.innerHeight && t.top > el.offsetHeight + VIEWPORT_MARGIN
      setPlacement({ x, above })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
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
      className="relative inline-flex"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return
        event.stopPropagation()
        close()
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !root.current?.contains(event.relatedTarget)) setOpen(false)
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
        className={chipClassName({ className: cn('min-w-0 pr-2.5', open && 'border-border-strong bg-surface-2') })}
      >
        <span className="sr-only">{label}: </span>
        {trigger}
        <ChevronDown
          aria-hidden="true"
          className={cn('size-3.5 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            initial={{ opacity: 0, y: placement.above ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement.above ? 4 : -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ left: placement.x }}
            // Keep focus on the listbox while clicking inside the panel; clicks still fire.
            onMouseDown={(event) => event.preventDefault()}
            className={cn(
              'absolute z-40 flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface text-sm text-foreground',
              placement.above ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
              className,
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
                  <div key={group.label} role="group" aria-labelledby={`${id}-group-${g}`} className="not-first:mt-1.5">
                    <div
                      id={`${id}-group-${g}`}
                      className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {group.label}
                    </div>
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
      </AnimatePresence>
    </div>
  )
}
