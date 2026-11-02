import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export function Spinner({ className, ...props }: ComponentProps<'svg'>) { return <Loader2 aria-hidden="true" className={cn('size-4 animate-spin motion-reduce:animate-none', className)} {...props} /> }
