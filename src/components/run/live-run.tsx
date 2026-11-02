import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useRunStream } from '@/hooks/use-run-stream'
import { isInFlight } from '@/lib/domain'
import { runQuery } from '@/lib/queries'
import { RunView } from './run-view'
import { RunViewSkeleton } from './run-view-skeleton'

/**
 * Owner view of a run: streams pending responses in this tab, polls while the server
 * is generating detached work (e.g. after a refresh), and runs the AI judge.
 */
export function LiveRun({ runId, showOpenLink = false }: { runId: string; showOpenLink?: boolean }) {
  const query = useQuery({
    ...runQuery(runId),
    refetchInterval: (q) => (q.state.data?.responses.some(isInFlight) ? 2000 : false),
  })
  const live = useRunStream(query.data)

  if (query.data) {
    return (
      <RunView
        key={query.data.id}
        run={query.data}
        responses={live.responses}
        editable
        live={live}
        showOpenLink={showOpenLink}
      />
    )
  }
  if (query.isPending) return <RunViewSkeleton />
  return (
    <EmptyState
      icon={<SearchX className="size-5" />}
      title="Run not found"
      description="It may have been deleted, or it belongs to another account."
      action={
        <Link to="/history" className={buttonVariants({ variant: 'outline' })}>
          Go to history
        </Link>
      }
    />
  )
}
