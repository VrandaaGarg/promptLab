import { motion } from 'motion/react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
export type SwitchProps = Omit<ComponentProps<'button'>, 'onChange'> & { checked: boolean; onCheckedChange: (checked: boolean) => void }
export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) { return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} className={cn('relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50', checked ? 'bg-primary' : 'bg-border-strong', className)} {...props}><motion.span aria-hidden="true" animate={{ x: checked ? 16 : 0 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="block size-5 rounded-full bg-surface" /></button> }
