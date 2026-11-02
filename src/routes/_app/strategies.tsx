import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { StrategyCard } from '@/components/strategies/strategy-card'
import { StrategyDetailsDialog } from '@/components/strategies/strategy-details-dialog'
import { StrategyFormDialog } from '@/components/strategies/strategy-form-dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { useDeleteStrategy } from '@/hooks/use-strategy-mutations'
import { staggerContainer } from '@/lib/motion'
import { strategiesQuery } from '@/lib/queries'
import type { Strategy } from '@/server/strategies'

export const Route = createFileRoute('/_app/strategies')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(strategiesQuery()),
  head: () => ({ meta: [{ title: 'Strategies — PromptLab' }] }),
  component: StrategiesPage,
})

/** The strategy is kept after closing so dialogs don't change content during their exit animation. */
type DialogState = { kind: 'form' | 'view' | 'delete' | null; strategy: Strategy | null }

function StrategyGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={staggerContainer(0.04)}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  )
}

function StrategiesPage() {
  const { data: strategies } = useSuspenseQuery(strategiesQuery())
  const [dialog, setDialog] = useState<DialogState>({ kind: null, strategy: null })
  const open = (kind: DialogState['kind'], strategy: Strategy | null) => setDialog({ kind, strategy })
  const close = (isOpen: boolean) => !isOpen && setDialog((d) => ({ ...d, kind: null }))
  const deleteStrategy = useDeleteStrategy()

  const builtIns = strategies.filter((s) => s.userId === null)
  const custom = strategies.filter((s) => s.userId !== null)
  const card = (s: Strategy) => (
    <StrategyCard
      key={s.id}
      strategy={s}
      onView={() => open('view', s)}
      onEdit={() => open('form', s)}
      onDelete={() => open('delete', s)}
    />
  )

  return (
    <div className="space-y-10">
      <PageHeader
        title="Strategies"
        description="How a task becomes a prompt. Built-ins cover the classics; add your own to test new ideas."
        actions={
          <Button onClick={() => open('form', null)}>
            <Plus className="size-4" />
            New strategy
          </Button>
        }
      />

      <section aria-labelledby="custom-heading" className="space-y-4">
        <h2 id="custom-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Your strategies <span className="font-mono">{custom.length}</span>
        </h2>
        {custom.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-strong">
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No custom strategies yet"
              description="Write a template with {{task}}, {{examples}} and {{role}}, then race it against the built-ins in the arena."
              action={
                <Button variant="outline" onClick={() => open('form', null)}>
                  <Plus className="size-4" />
                  New strategy
                </Button>
              }
            />
          </div>
        ) : (
          <StrategyGrid>{custom.map(card)}</StrategyGrid>
        )}
      </section>

      <section aria-labelledby="builtin-heading" className="space-y-4">
        <h2 id="builtin-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Built-in <span className="font-mono">{builtIns.length}</span>
        </h2>
        <StrategyGrid>{builtIns.map(card)}</StrategyGrid>
      </section>

      <StrategyFormDialog open={dialog.kind === 'form'} onOpenChange={close} strategy={dialog.strategy} />
      <StrategyDetailsDialog open={dialog.kind === 'view'} onOpenChange={close} strategy={dialog.strategy} />
      <ConfirmDialog
        open={dialog.kind === 'delete'}
        onOpenChange={close}
        title={`Delete “${dialog.strategy?.name ?? ''}”?`}
        description="Past runs keep their responses, but this strategy won't be available for new runs."
        confirmLabel="Delete strategy"
        pending={deleteStrategy.isPending}
        onConfirm={() => {
          if (!dialog.strategy) return
          deleteStrategy.mutate({ id: dialog.strategy.id }, { onSuccess: () => close(false) })
        }}
      />
    </div>
  )
}
