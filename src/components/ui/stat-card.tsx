import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'
export type StatCardProps = { label: ReactNode; value: ReactNode; hint?: ReactNode; icon?: ReactNode; className?: string }
export function StatCard({ label, value, hint, icon, className }: StatCardProps) { return <Card className={cn('p-5', className)}><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p>{icon && <span aria-hidden="true" className="text-muted-foreground">{icon}</span>}</div><div className="mt-3 font-mono text-2xl font-medium tracking-tight">{value}</div>{hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}</Card> }
