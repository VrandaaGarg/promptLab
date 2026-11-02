import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
const variants = { neutral: 'bg-surface-2 text-muted-foreground', primary: 'bg-accent text-primary', outline: 'border border-border-strong text-foreground', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning', destructive: 'bg-destructive/10 text-destructive' } as const
export type BadgeProps = ComponentProps<'span'> & { variant?: keyof typeof variants; dotColor?: string }
export function Badge({ variant = 'neutral', dotColor, className, children, ...props }: BadgeProps) { return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', variants[variant], className)} {...props}>{dotColor && <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}{children}</span> }
