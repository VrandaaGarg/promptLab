import { createFileRoute, Link } from '@tanstack/react-router'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { Hero } from '@/components/landing/hero'
import { LandingFooter } from '@/components/landing/landing-footer'
import { StrategyShowcase } from '@/components/landing/strategy-showcase'
import { PublicHeader } from '@/components/layout/public-header'
import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { user } = Route.useRouteContext()
  const signedIn = Boolean(user)

  return (
    <div className="min-h-dvh">
      <PublicHeader
        actions={
          signedIn ? (
            <Link to="/arena" className={buttonVariants({ size: 'sm' })}>
              Open app
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ size: 'sm', variant: 'ghost' })}>
                Sign in
              </Link>
              <Link to="/signup" className={buttonVariants({ size: 'sm' })}>
                Get started
              </Link>
            </>
          )
        }
      />
      <main>
        <Hero signedIn={signedIn} />
        <StrategyShowcase />
        <FeatureGrid />
      </main>
      <LandingFooter signedIn={signedIn} />
    </div>
  )
}
