import type { Transition, Variants } from 'motion/react'
export const fast: Transition = { duration: 0.15, ease: 'easeOut' }
export const base: Transition = { duration: 0.25, ease: 'easeOut' }
export const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: base }, exit: { opacity: 0, transition: fast } }
export const fadeUp: Variants = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: base }, exit: { opacity: 0, y: 6, transition: fast } }
export const staggerContainer = (stagger = 0.05): Variants => ({ hidden: {}, visible: { transition: { staggerChildren: stagger } } })
export const collapse: Variants = { hidden: { height: 0, opacity: 0 }, visible: { height: 'auto', opacity: 1, transition: base }, exit: { height: 0, opacity: 0, transition: fast } }
