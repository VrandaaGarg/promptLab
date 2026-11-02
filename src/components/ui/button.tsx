import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'
const variants = { primary: 'bg-primary text-primary-foreground hover:bg-primary/90', secondary: 'bg-surface-2 text-foreground hover:bg-border', outline: 'border border-border-strong bg-transparent hover:bg-surface-2', ghost: 'hover:bg-surface-2', destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' } as const
const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-3.5 text-sm', lg: 'h-11 px-5 text-sm', icon: 'size-9', 'icon-sm': 'size-8' } as const
export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes
export function buttonVariants({ variant = 'primary', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) { return cn('inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0', variants[variant], sizes[size], className) }
export type ButtonProps = ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }
export function Button({ variant, size, loading = false, disabled, className, children, type = 'button', ...props }: ButtonProps) { return <button type={type} className={buttonVariants({ variant, size, className })} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <Spinner className="size-4" />}{children}</button> }
