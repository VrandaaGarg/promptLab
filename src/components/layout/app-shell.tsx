import { useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/server/middleware'
import { MainNav } from './main-nav'
import { UserMenu } from './user-menu'

/** Pages that lay out up to five response columns get the wide container. */
const WIDE_PREFIXES = ['/arena', '/runs/']

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const wide = WIDE_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
          <Logo to="/arena" />
          <MainNav className="hidden md:block" />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
        <MainNav variant="mobile" className="md:hidden" />
      </header>
      <main
        id="main"
        className={cn('mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10', wide ? 'max-w-[1400px]' : 'max-w-6xl')}
      >
        {children}
      </main>
    </div>
  )
}
