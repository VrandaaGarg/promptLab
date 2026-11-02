import type { ReactNode } from 'react'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'

/** Minimal header for public pages: landing, auth, shared runs. */
export function PublicHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  )
}
