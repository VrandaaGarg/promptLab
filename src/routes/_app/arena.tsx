import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ArenaPlaceholder } from '@/components/arena/arena-placeholder'
import { Composer } from '@/components/arena/composer'
import { LiveRun } from '@/components/run/live-run'
import { PageHeader } from '@/components/ui/page-header'
import { useCreateRun } from '@/hooks/use-run-mutations'
import { MAX_TASK_LENGTH } from '@/lib/domain'
import { MODEL_IDS } from '@/lib/models'
import { runQuery, strategiesQuery } from '@/lib/queries'

const arenaSearchSchema = z.object({
  run: z.uuid().optional().catch(undefined),
  task: z.string().max(MAX_TASK_LENGTH).optional().catch(undefined),
  model: z.enum(MODEL_IDS).optional().catch(undefined),
})

const RESULTS_ID = 'run-results'

export const Route = createFileRoute('/_app/arena')({
  validateSearch: arenaSearchSchema,
  loaderDeps: ({ search }) => ({ run: search.run }),
  loader: async ({ context: { queryClient }, deps }) => {
    await Promise.all([
      queryClient.ensureQueryData(strategiesQuery()),
      // A missing run is handled inline by LiveRun rather than failing the page.
      deps.run ? queryClient.ensureQueryData(runQuery(deps.run)).catch(() => undefined) : undefined,
    ])
  },
  head: () => ({ meta: [{ title: 'Arena — PromptLab' }] }),
  component: ArenaPage,
})

function ArenaPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: strategies } = useSuspenseQuery(strategiesQuery())
  const createRun = useCreateRun()

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Arena" description="One task, every prompting strategy, streamed side by side." />
        <Composer
          key={`${search.task ?? ''}|${search.model ?? ''}`}
          strategies={strategies}
          initialTask={search.task}
          initialModel={search.model}
          pending={createRun.isPending}
          onSubmit={async (input) => {
            const run = await createRun.mutateAsync(input)
            await navigate({ search: (prev) => ({ ...prev, run: run.id }), replace: true })
            requestAnimationFrame(() => {
              const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              document.getElementById(RESULTS_ID)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
            })
          }}
        />
      </div>
      <section id={RESULTS_ID} aria-label="Results" className="scroll-mt-28">
        {search.run ? <LiveRun key={search.run} runId={search.run} showOpenLink /> : <ArenaPlaceholder />}
      </section>
    </div>
  )
}
