import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Compact pill used by toolbar controls (toggles, disclosure buttons, dropdown triggers). */
export function chipClassName({ active = false, className }: { active?: boolean; className?: string } = {}) {
  return cn(
    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0',
    active ? 'border-primary bg-accent text-primary' : 'border-border bg-surface text-foreground hover:bg-surface-2',
    className,
  )
}

export type ToggleChipProps = Omit<ComponentProps<'button'>, 'onChange'> & { pressed: boolean; onPressedChange: (pressed: boolean) => void; icon?: ReactNode }

export function ToggleChip({ pressed, onPressedChange, icon, children, className, ...props }: ToggleChipProps) {
  return (
    <button type="button" aria-pressed={pressed} onClick={() => onPressedChange(!pressed)} className={chipClassName({ active: pressed, className })} {...props}>
      {icon}
      {children}
    </button>
  )
}
