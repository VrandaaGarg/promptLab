import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isInFlight, type ResponseStatus } from '@/lib/domain'
import { runQuery } from '@/lib/queries'
import type { RunDetail, RunResponse } from '@/server/runs'
import { useJudgeRun } from './use-run-mutations'

type LiveState = { output: string; status: ResponseStatus; error: string | null }

async function streamResponse(responseId: string, onDelta: (text: string) => void): Promise<void> {
  const res = await fetch(`/api/stream/${responseId}`, { method: 'POST' })
  if (!res.ok || !res.body) {
    throw new Error((await res.text().catch(() => '')) || `Request failed (${res.status})`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    onDelta(decoder.decode(value, { stream: true }))
  }
  const rest = decoder.decode()
  if (rest) onDelta(rest)
}

/**
 * Streams every pending response of a run in parallel, merges live text over the cached run,
 * refreshes the run from the database, and asks the AI judge to score it once everything settled.
 */
export function useRunStream(run: RunDetail | undefined) {
  const queryClient = useQueryClient()
  const judge = useJudgeRun()
  const judgeRun = judge.mutate
  const [live, setLive] = useState<Record<string, LiveState>>({})
  const started = useRef(new Set<string>())

  const patch = useCallback((id: string, update: (prev: LiveState) => LiveState) => {
    setLive((all) => ({ ...all, [id]: update(all[id] ?? { output: '', status: 'pending', error: null }) }))
  }, [])

  const runId = run?.id
  const pendingIds = useMemo(
    () => run?.responses.filter((r) => r.status === 'pending').map((r) => r.id) ?? [],
    [run],
  )

  useEffect(() => {
    if (!runId) return
    const toStart = pendingIds.filter((id) => !started.current.has(id))
    if (toStart.length === 0) return
    toStart.forEach((id) => started.current.add(id))

    // Intentionally not aborted on unmount: generation continues server-side either way, and
    // keeping the request alive survives React StrictMode's double-invoked effects.
    void Promise.allSettled(
      toStart.map(async (id) => {
        patch(id, (s) => ({ ...s, status: 'streaming' }))
        try {
          await streamResponse(id, (delta) => patch(id, (s) => ({ ...s, output: s.output + delta })))
          patch(id, (s) => ({ ...s, status: 'done' }))
        } catch (error) {
          patch(id, (s) => ({
            ...s,
            status: 'error',
            error: error instanceof Error ? error.message : 'Generation failed',
          }))
        }
      }),
    ).then(async () => {
      await queryClient.fetchQuery({ ...runQuery(runId), staleTime: 0 }).catch(() => undefined)
      setLive((all) => {
        const next = { ...all }
        toStart.forEach((id) => delete next[id])
        return next
      })
    })
  }, [runId, pendingIds, patch, queryClient])

  const isStreaming = Object.values(live).some(isInFlight)

  // Judge from persisted state, so it also happens after a refresh or for a finished but unscored run.
  // One automatic attempt per run per page; failures surface a manual retry instead of looping.
  const autoJudged = useRef(new Set<string>())
  useEffect(() => {
    if (!run || isStreaming || autoJudged.current.has(run.id)) return
    const settled = !run.responses.some(isInFlight)
    const needsScores = run.responses.some((r) => r.status === 'done' && r.output.trim() && !r.judgeScore)
    if (settled && needsScores) {
      autoJudged.current.add(run.id)
      judgeRun({ id: run.id })
    }
  }, [run, isStreaming, judgeRun])

  const responses: RunResponse[] = useMemo(
    () =>
      run?.responses.map((r) => {
        const l = live[r.id]
        return l ? { ...r, output: l.output, status: l.status, error: l.error ?? r.error } : r
      }) ?? [],
    [run, live],
  )

  return {
    responses,
    isStreaming,
    isJudging: judge.isPending,
    judgeError: judge.error?.message ?? null,
    runJudge: () => {
      if (runId) judgeRun({ id: runId })
    },
  }
}
