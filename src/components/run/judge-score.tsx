import { motion } from 'motion/react'
import type { JudgeScore } from '@/lib/domain'
import { formatScore } from '@/lib/format'

const CRITERIA = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'completeness', label: 'Completeness' },
] as const

/** A thin 0–10 bar; `color` defaults to the primary token. */
export function ScoreBar({ value, color = 'var(--primary)' }: { value: number; color?: string }) {
  return (
    <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
      <motion.span
        className="block h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / 10) * 100}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </span>
  )
}

/** Overall score with the per-criterion breakdown and the judge's reasoning. */
export function JudgeScoreBreakdown({ score }: { score: JudgeScore }) {
  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-medium tracking-tight tabular-nums">{formatScore(score.overall)}</span>
        <span className="font-mono text-sm text-muted-foreground">/10</span>
        <span className="sr-only">overall</span>
      </p>
      <dl className="mt-4 space-y-2.5">
        {CRITERIA.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[6.5rem_minmax(0,1fr)_1.75rem] items-center gap-2 text-xs">
            <dt className="text-muted-foreground">{label}</dt>
            <ScoreBar value={score[key]} />
            <dd className="text-right font-mono tabular-nums">{score[key]}</dd>
          </div>
        ))}
      </dl>
      {score.reason && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{score.reason}</p>}
    </div>
  )
}
