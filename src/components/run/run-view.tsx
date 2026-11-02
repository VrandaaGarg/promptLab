import { motion } from 'motion/react'
import { useRateResponse, useSetWinner } from '@/hooks/use-run-mutations'
import { staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'
import { BlindBanner } from './blind-banner'
import { JudgeBar } from './judge-bar'
import { ResponseCard } from './response-card'
import { RunActions } from './run-actions'
import { RunExamples } from './run-examples'
import { RunHeader } from './run-header'
import type { RunLiveState, RunViewData } from './types'
import { useBlindReveal } from './use-blind-reveal'

/** Column layout by response count, so 4 responses don't leave a ragged 3+1 grid. */
const GRID_COLUMNS: Record<number, string> = {
  1: 'max-w-3xl',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
  5: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
}

export type RunViewProps = {
  run: RunViewData
  /** Responses to render; owners pass the live-merged list from useRunStream. */
  responses?: RunResponse[]
  /** Owner controls: rating, winner, share, re-run, delete. */
  editable: boolean
  live?: RunLiveState
  /** Link to the standalone run page (used inside the arena). */
  showOpenLink?: boolean
}

export function RunView({ run, responses = run.responses, editable, live, showOpenLink = false }: RunViewProps) {
  const rate = useRateResponse(run.id)
  const setWinner = useSetWinner(run.id)
  const blind = useBlindReveal({ blindMode: run.blindMode, responses, editable })

  return (
    <div className="space-y-6">
      <RunHeader
        run={run}
        actions={
          <RunActions
            run={run}
            responses={responses}
            identityOf={blind.identityOf}
            editable={editable}
            showOpenLink={showOpenLink}
          />
        }
      />

      {blind.blind && (
        <BlindBanner hidden={blind.hidden} ratedCount={blind.ratedCount} doneCount={blind.doneCount} onReveal={blind.reveal} />
      )}

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="visible"
        className={cn('grid grid-cols-1 gap-4', GRID_COLUMNS[blind.ordered.length] ?? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}
      >
        {blind.ordered.map((response) => (
          <ResponseCard
            key={response.id}
            response={response}
            identity={blind.identityOf(response.id)}
            examples={run.examples}
            judgeModel={run.judgeModel}
            editable={editable}
            onRate={(rating) => rate.mutate({ responseId: response.id, rating })}
            onToggleWinner={(isWinner) => setWinner.mutate({ responseId: response.id, isWinner })}
          />
        ))}
      </motion.div>

      <JudgeBar responses={responses} judgeModel={run.judgeModel} identityOf={blind.identityOf} live={live} />

      <RunExamples examples={run.examples} />
    </div>
  )
}
