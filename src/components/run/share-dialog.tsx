import { Globe, Lock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'
import { toast } from 'sonner'
import { CopyButton } from '@/components/ui/copy-button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useSetRunSharing } from '@/hooks/use-run-mutations'
import { collapse } from '@/lib/motion'

function shareUrl(slug: string) {
  return `${window.location.origin}/r/${slug}`
}

export function ShareDialog({
  open,
  onOpenChange,
  runId,
  shareSlug,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  runId: string
  shareSlug: string | null
}) {
  const sharing = useSetRunSharing()
  const switchId = useId()
  const shared = Boolean(shareSlug)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share this run"
      description="Anyone with the link can view the task, prompts and responses. Ratings stay private."
    >
      <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-3">
          {shared ? (
            <Globe aria-hidden="true" className="size-4 text-primary" />
          ) : (
            <Lock aria-hidden="true" className="size-4 text-muted-foreground" />
          )}
          <label htmlFor={switchId} className="text-sm">
            <span className="block font-medium">Public link</span>
            <span className="block text-xs text-muted-foreground">{shared ? 'Anyone with the link' : 'Only you'}</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          {sharing.isPending && <Spinner className="text-muted-foreground" />}
          <Switch
            id={switchId}
            checked={shared}
            disabled={sharing.isPending}
            onCheckedChange={(checked) => sharing.mutate({ id: runId, shared: checked })}
          />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {shareSlug && (
          <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
            <div className="flex items-center gap-2 pt-4">
              <Input
                readOnly
                aria-label="Share link"
                value={shareUrl(shareSlug)}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-xs"
              />
              <CopyButton
                text={shareUrl(shareSlug)}
                variant="outline"
                size="icon"
                onCopy={() => toast.success('Link copied')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
