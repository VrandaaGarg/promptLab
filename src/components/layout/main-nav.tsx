import { Link, useLocation } from '@tanstack/react-router'
import { ChartColumn, FlaskConical, History, Layers, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type NavItem = { to: '/arena' | '/history' | '/insights' | '/strategies'; label: string; icon: LucideIcon; also?: string[] }

const NAV_ITEMS: NavItem[] = [
  { to: '/arena', label: 'Arena', icon: FlaskConical },
  { to: '/history', label: 'History', icon: History, also: ['/runs'] },
  { to: '/insights', label: 'Insights', icon: ChartColumn },
  { to: '/strategies', label: 'Strategies', icon: Layers },
]

const isActive = (pathname: string, item: NavItem) =>
  [item.to, ...(item.also ?? [])].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

const indicatorTransition = { type: 'spring', stiffness: 500, damping: 40 } as const

export function MainNav({ variant = 'desktop', className }: { variant?: 'desktop' | 'mobile'; className?: string }) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const desktop = variant === 'desktop'

  return (
    <nav aria-label="Main" className={className}>
      <ul
        className={cn(
          'flex items-center',
          desktop ? 'h-14 gap-1' : 'scrollbar-none gap-1 overflow-x-auto px-3 pb-2',
        )}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.to} className={cn('relative', desktop && 'flex h-full items-center')}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative isolate inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  !desktop && !active && 'hover:bg-surface-2',
                )}
              >
                <Icon aria-hidden="true" className={cn('size-4', !desktop && 'size-3.5')} />
                {item.label}
                {active && !desktop && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    transition={indicatorTransition}
                    className="absolute inset-0 -z-10 rounded-md bg-surface-2"
                  />
                )}
              </Link>
              {active && desktop && (
                <motion.span
                  layoutId="desktop-nav-indicator"
                  transition={indicatorTransition}
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-foreground"
                />
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
