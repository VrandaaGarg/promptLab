import { Maximize2, Minimize2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useRateResponse, useSetWinner } from '@/hooks/use-run-mutations'
import type { RunResponse } from '@/server/runs'
import { BlindBanner } from './blind-banner'
import { ResponseGrid } from './response-grid'
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
  /** 'grid' shows every strategy side by side; 'tabs' expands one at a time. */
  const [view, setView] = useState<'grid' | 'tabs'>('grid')
  const focusTab = useRef(false)

  const open = (id: string) => {
    setActiveId(id)
    if (view === 'grid') {
      focusTab.current = true
      setView('tabs')
    }
  }

  // The card that opened a tab unmounts, so hand focus to the tab it opened.
  useEffect(() => {
    if (view !== 'tabs' || !focusTab.current || !active) return
    focusTab.current = false
    document.getElementById(tabId(idPrefix, active.id))?.focus()
  }, [view, active?.id, idPrefix])

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
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              {view === 'tabs' ? (
                <StrategyTabs
                  responses={blind.ordered}
                  activeId={active.id}
                  onSelect={setActiveId}
                  identityOf={blind.identityOf}
                  idPrefix={idPrefix}
                />
              ) : (
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {blind.blind ? 'Responses' : 'Strategies'}{' '}
                  <span className="font-mono tabular-nums">{blind.ordered.length}</span>
                </h2>
              )}
            </div>
            <Tooltip content={view === 'grid' ? 'Expand to tab view' : 'Show all side by side'} align="end" className="shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Tab view"
                aria-pressed={view === 'tabs'}
                onClick={() => setView(view === 'grid' ? 'tabs' : 'grid')}
                className="text-muted-foreground hover:text-foreground"
              >
                {view === 'grid' ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
              </Button>
            </Tooltip>
          </div>
          <motion.div
            key={view === 'tabs' ? active.id : 'grid'}
            {...(view === 'tabs' && {
              role: 'tabpanel',
              id: panelId(idPrefix),
              'aria-labelledby': tabId(idPrefix, active.id),
            })}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {view === 'tabs' ? (
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
            ) : (
              <ResponseGrid
                responses={blind.ordered}
                identityOf={blind.identityOf}
                editable={editable}
                onRate={(responseId, rating) => rate.mutate({ responseId, rating })}
                onOpen={open}
              />
            )}
          </motion.div>
        </div>
      )}

      <RunSummary
        responses={blind.ordered}
        judgeModel={run.judgeModel}
        identityOf={blind.identityOf}
        live={live}
        activeId={view === 'tabs' ? active?.id : undefined}
        onSelect={open}
      />
    </div>
  )
}
