import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export function Select({ className, children, ...props }: ComponentProps<'select'>) { return <span className="relative block"><select className={cn('h-9 w-full appearance-none rounded-md border border-input bg-surface py-1 pl-3 pr-9 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50', className)} {...props}>{children}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /></span> }
