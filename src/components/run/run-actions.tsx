import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftRight, ArrowUpRight, Globe, RotateCcw, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { buttonVariants, Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tooltip } from '@/components/ui/tooltip'
import { useDeleteRun } from '@/hooks/use-run-mutations'
import { MODEL_IDS, type ModelId } from '@/lib/models'
import type { RunResponse } from '@/server/runs'
import { CompareDialog } from './compare-dialog'
import { ShareDialog } from './share-dialog'
import type { ResponseIdentity, RunViewData } from './types'

const asModelId = (model: string): ModelId | undefined => MODEL_IDS.find((id) => id === model)

type RunActionsProps = {
  run: RunViewData
  responses: RunResponse[]
  identityOf: (id: string) => ResponseIdentity
  editable: boolean
  showOpenLink: boolean
}

export function RunActions({ run, responses, identityOf, editable, showOpenLink }: RunActionsProps) {
  const [dialog, setDialog] = useState<'share' | 'delete' | 'compare' | null>(null)
  const deleteRun = useDeleteRun()
  const navigate = useNavigate()
  const comparable = responses.filter((r) => r.status === 'done' && r.output).length >= 2
  const close = (open: boolean) => !open && setDialog(null)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {comparable && (
        <Button variant="outline" size="sm" onClick={() => setDialog('compare')}>
          <ArrowLeftRight className="size-3.5" />
          Compare
        </Button>
      )}
      {editable && (
        <>
          <Button variant="outline" size="sm" onClick={() => setDialog('share')}>
            {run.shareSlug ? <Globe className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
            {run.shareSlug ? 'Shared' : 'Share'}
          </Button>
          <Link
            to="/arena"
            search={{ task: run.task, model: asModelId(run.model) }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <RotateCcw className="size-3.5" />
            Re-run
          </Link>
          {showOpenLink && (
            <Tooltip content="Open run page">
              <Link
                to="/runs/$runId"
                params={{ runId: run.id }}
                aria-label="Open run page"
                className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </Tooltip>
          )}
          <Tooltip content="Delete run">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete run"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDialog('delete')}
            >
              <Trash2 className="size-4" />
            </Button>
          </Tooltip>

          <ShareDialog open={dialog === 'share'} onOpenChange={close} runId={run.id} shareSlug={run.shareSlug} />
          <ConfirmDialog
            open={dialog === 'delete'}
            onOpenChange={close}
            title="Delete this run?"
            description="The task, all responses, ratings and judge scores will be permanently removed. Shared links stop working."
            confirmLabel="Delete run"
            pending={deleteRun.isPending}
            onConfirm={() =>
              deleteRun.mutate(
                { id: run.id },
                {
                  onSuccess: () => {
                    setDialog(null)
                    void navigate({ to: '/history' })
                  },
                },
              )
            }
          />
        </>
      )}
      {comparable && (
        <CompareDialog open={dialog === 'compare'} onOpenChange={close} responses={responses} identityOf={identityOf} />
      )}
    </div>
  )
}
