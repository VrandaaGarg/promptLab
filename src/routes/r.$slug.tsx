import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { PublicHeader } from '@/components/layout/public-header'
import { NotFound } from '@/components/layout/status-views'
import { RunView } from '@/components/run/run-view'
import { buttonVariants } from '@/components/ui/button'
import { sharedRunQuery } from '@/lib/queries'

export const Route = createFileRoute('/r/$slug')({
  loader: ({ context: { queryClient }, params }) => queryClient.ensureQueryData(sharedRunQuery(params.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.task.slice(0, 60)} — PromptLab` : 'Shared run — PromptLab' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  errorComponent: () => (
    <SharedLayout>
      <NotFound title="Run unavailable" description="This shared run doesn't exist or is no longer shared." />
    </SharedLayout>
  ),
  component: SharedRunPage,
})

function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader
        actions={
          <Link to="/" className={buttonVariants({ size: 'sm' })}>
            Try PromptLab
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}

function SharedRunPage() {
  const { slug } = Route.useParams()
  const { data: run } = useSuspenseQuery(sharedRunQuery(slug))
  return (
    <SharedLayout>
      <p className="mb-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Shared experiment</p>
      <RunView run={run} editable={false} />
    </SharedLayout>
  )
}
