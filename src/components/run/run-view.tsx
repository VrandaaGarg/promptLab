import { motion } from 'motion/react'
import { useId, useState } from 'react'
import { useRateResponse, useSetWinner } from '@/hooks/use-run-mutations'
import type { RunResponse } from '@/server/runs'
import { BlindBanner } from './blind-banner'
import { ResponsePanel, type PanelSection } from './response-panel'
import { RunActions } from './run-actions'
import { RunHeader } from './run-header'
import { RunSummary } from './run-summary'
import { StrategyTabs, panelId, tabId } from './strategy-tabs'
import type { RunLiveState, RunViewData } from './types'
import { useBlindReveal } from './use-blind-reveal'

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
  const idPrefix = useId()
  const [activeId, setActiveId] = useState<string>()
  const [section, setSection] = useState<PanelSection>('response')
  const active = blind.ordered.find((r) => r.id === activeId) ?? blind.ordered[0]

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

      {active && (
        <div className="space-y-4">
          <StrategyTabs
            responses={blind.ordered}
            activeId={active.id}
            onSelect={setActiveId}
            identityOf={blind.identityOf}
            idPrefix={idPrefix}
          />
          <motion.div
            key={active.id}
            role="tabpanel"
            id={panelId(idPrefix)}
            aria-labelledby={tabId(idPrefix, active.id)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ResponsePanel
              response={active}
              identity={blind.identityOf(active.id)}
              judgeModel={run.judgeModel}
              editable={editable}
              live={live}
              section={section}
              onSectionChange={setSection}
              onRate={(rating) => rate.mutate({ responseId: active.id, rating })}
              onToggleWinner={(isWinner) => setWinner.mutate({ responseId: active.id, isWinner })}
            />
          </motion.div>
        </div>
      )}

      <RunSummary
        responses={blind.ordered}
        judgeModel={run.judgeModel}
        identityOf={blind.identityOf}
        live={live}
        activeId={active?.id}
        onSelect={setActiveId}
      />
    </div>
  )
}
