import { Scale } from 'lucide-react'
import { motion } from 'motion/react'
import { Popover } from '@/components/ui/popover'
import type { JudgeScore } from '@/lib/domain'
import { getModelLabel } from '@/lib/models'

const CRITERIA = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'completeness', label: 'Completeness' },
] as const

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.span
          className="block h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </span>
      <span className="text-right font-mono tabular-nums">{value}</span>
    </div>
  )
}

export function JudgeScorePill({ score, judgeModel }: { score: JudgeScore; judgeModel: string }) {
  return (
    <Popover
      label="AI judge score breakdown"
      side="top"
      align="end"
      className="w-72 p-3"
      trigger={
        <button
          type="button"
          aria-label={`AI judge score ${score.overall} out of 10. Show breakdown`}
          className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 px-2.5 text-xs transition-colors hover:bg-border"
        >
          <Scale aria-hidden="true" className="size-3.5 text-muted-foreground" />
          <span className="font-mono font-medium tabular-nums">{score.overall}</span>
          <span className="font-mono text-muted-foreground">/10</span>
        </button>
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium">AI judge</p>
        <p className="text-xs text-muted-foreground">{getModelLabel(judgeModel)}</p>
      </div>
      <div className="mt-3 space-y-2">
        {CRITERIA.map((c) => (
          <ScoreBar key={c.key} label={c.label} value={score[c.key]} />
        ))}
      </div>
      {score.reason && <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">{score.reason}</p>}
    </Popover>
  )
}
