import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
export type PageHeaderProps = { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }
export function PageHeader({ title, description, actions, className }: PageHeaderProps) { return <header className={cn('flex flex-wrap items-start justify-between gap-4', className)}><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}</div>{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}</header> }
