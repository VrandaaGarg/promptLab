import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) { return <input type={type} className={cn('h-9 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} /> }
