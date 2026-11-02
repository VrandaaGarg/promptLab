import { Monitor, Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useTheme, type Theme } from './theme-provider'
const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
export function ThemeToggle(props: Omit<ButtonProps, 'children' | 'onClick'>) { const { theme, setTheme } = useTheme(); const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor; return <Button variant="ghost" size="icon" aria-label={`Theme: ${theme}. Switch to ${next[theme]} theme`} onClick={() => setTheme(next[theme])} {...props}><AnimatePresence mode="wait" initial={false}><motion.span key={theme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}><Icon className="size-4" aria-hidden="true" /></motion.span></AnimatePresence></Button> }
