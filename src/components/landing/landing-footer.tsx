import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { buttonVariants } from '@/components/ui/button'

export function LandingFooter({ signedIn }: { signedIn: boolean }) {
  return (
    <footer>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Stop guessing. Start measuring.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Your first comparison takes about thirty seconds.</p>
        </div>
        <Link to={signedIn ? '/arena' : '/signup'} className={buttonVariants({ size: 'lg' })}>
          {signedIn ? 'Open the arena' : 'Get started free'}
          <ArrowRight className="size-4" />
        </Link>
      </section>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <Logo />
          <p>Compare prompting strategies side by side.</p>
        </div>
      </div>
    </footer>
  )
}
