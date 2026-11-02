import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { NotFound } from '@/components/layout/status-views'
import { LiveRun } from '@/components/run/live-run'
import { RunViewSkeleton } from '@/components/run/run-view-skeleton'
import { runQuery } from '@/lib/queries'

export const Route = createFileRoute('/_app/runs/$runId')({
  loader: ({ context: { queryClient }, params }) => queryClient.ensureQueryData(runQuery(params.runId)),
  head: () => ({ meta: [{ title: 'Run — PromptLab' }] }),
  pendingComponent: () => <RunViewSkeleton />,
  errorComponent: () => (
    <NotFound title="Run not found" description="This run doesn't exist, was deleted, or belongs to another account." />
  ),
  component: RunPage,
})

function RunPage() {
  const { runId } = Route.useParams()
  return (
    <div className="space-y-6">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        History
      </Link>
      <LiveRun key={runId} runId={runId} />
    </div>
  )
}
