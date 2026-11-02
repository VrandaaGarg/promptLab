import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Three columns of differing height: strategies, side by side, measured. */
export function LogoMark({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6', className)} {...props}>
      <rect width="24" height="24" rx="6" fill="var(--primary)" />
      <rect x="6" y="9" width="2.75" height="9" rx="1.25" fill="var(--primary-foreground)" />
      <rect x="10.625" y="5.5" width="2.75" height="12.5" rx="1.25" fill="var(--primary-foreground)" />
      <rect x="15.25" y="11.5" width="2.75" height="6.5" rx="1.25" fill="var(--primary-foreground)" opacity="0.7" />
    </svg>
  )
}

export function Logo({ to = '/', className }: { to?: '/' | '/arena'; className?: string }) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight', className)}
    >
      <LogoMark />
      <span>PromptLab</span>
    </Link>
  )
}
