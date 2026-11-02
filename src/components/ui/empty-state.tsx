import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
export type EmptyStateProps = { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) { return <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>{icon && <div aria-hidden="true" className="mb-4 flex size-10 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">{icon}</div>}<h3 className="text-sm font-semibold">{title}</h3>{description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}{action && <div className="mt-5">{action}</div>}</div> }
