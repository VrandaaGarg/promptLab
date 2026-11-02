import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FlaskConical, SearchX } from 'lucide-react'
import { motion } from 'motion/react'
import { z } from 'zod'
import { HistoryPagination } from '@/components/history/history-pagination'
import { HistorySkeleton } from '@/components/history/history-skeleton'
import { HistoryToolbar, type HistoryFilters } from '@/components/history/history-toolbar'
import { RunListCards } from '@/components/history/run-list-cards'
import { RunsTable } from '@/components/history/runs-table'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { TASK_CATEGORIES } from '@/lib/domain'
import { MODEL_IDS } from '@/lib/models'
import { fadeIn } from '@/lib/motion'
import { runListQuery } from '@/lib/queries'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 15

const historySearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  search: z.string().max(200).optional().catch(undefined),
  category: z.enum(TASK_CATEGORIES).optional().catch(undefined),
  model: z.enum(MODEL_IDS).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/history')({
  validateSearch: historySearchSchema,
  loaderDeps: ({ search }) => ({ ...search, page: search.page ?? 1, pageSize: PAGE_SIZE }),
  loader: ({ context: { queryClient }, deps }) => queryClient.ensureQueryData(runListQuery(deps)),
  head: () => ({ meta: [{ title: 'History — PromptLab' }] }),
  pendingComponent: () => (
    <div className="space-y-6">
      <PageHeader title="History" description="Every experiment you've run." />
      <HistorySkeleton />
    </div>
  ),
  component: HistoryPage,
})

function HistoryPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const page = search.page ?? 1
  const { data, isFetching, isPlaceholderData } = useQuery(runListQuery({ ...search, page, pageSize: PAGE_SIZE }))
  const filtered = Boolean(search.search || search.category || search.model)

  const updateFilters = (patch: HistoryFilters) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }), replace: true })

  return (
    <div className="space-y-6">
      <PageHeader title="History" description="Every experiment you've run." />
      <HistoryToolbar filters={search} onChange={updateFilters} />

      {!data ? (
        <HistorySkeleton />
      ) : data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong">
          {filtered ? (
            <EmptyState
              icon={<SearchX className="size-5" />}
              title="No matching runs"
              description="Try a different search or clear the filters."
              action={
                <Link to="/history" className={buttonVariants({ variant: 'outline' })}>
                  Clear filters
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={<FlaskConical className="size-5" />}
              title="No runs yet"
              description="Send a task through the arena to compare strategies. Every run is saved here."
              action={
                <Link to="/arena" className={buttonVariants()}>
                  Open the arena
                </Link>
              }
            />
          )}
        </div>
      ) : (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={cn('space-y-4 transition-opacity', isFetching && isPlaceholderData && 'opacity-60')}
        >
          <div className="hidden md:block">
            <RunsTable runs={data.items} />
          </div>
          <div className="md:hidden">
            <RunListCards runs={data.items} />
          </div>
          <HistoryPagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={(next) => void navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) })}
          />
        </motion.div>
      )}
    </div>
  )
}
