import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queries'
import {
  createRun,
  deleteRun,
  judgeRun,
  rateResponse,
  setRunSharing,
  setWinner,
  type CreateRunInput,
  type RunDetail,
} from '@/server/runs'

function useRunCache() {
  const queryClient = useQueryClient()

  const update = (runId: string, fn: (run: RunDetail) => RunDetail) =>
    queryClient.setQueryData<RunDetail>(queryKeys.run(runId), (run) => (run ? fn(run) : run))

  /** Applies an optimistic change after cancelling in-flight fetches that could overwrite it. */
  const optimistic = async (runId: string, fn: (run: RunDetail) => RunDetail) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.run(runId) })
    update(runId, fn)
  }

  /** On failure, re-sync with the server instead of restoring a possibly outdated snapshot. */
  const resync = (runId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) })

  const invalidateLists = () => {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.runs, 'list'] })
    void queryClient.invalidateQueries({ queryKey: ['insights'] })
  }

  return { queryClient, update, optimistic, resync, invalidateLists }
}

const notifyError = (error: Error) => toast.error(error.message)

export function useCreateRun() {
  const { queryClient, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: CreateRunInput) => createRun({ data }),
    onSuccess: (run) => {
      queryClient.setQueryData(queryKeys.run(run.id), run)
      invalidateLists()
    },
    onError: notifyError,
  })
}

export function useJudgeRun() {
  const { queryClient, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: { id: string }) => judgeRun({ data }),
    onSuccess: (judged) => {
      // Keep feedback from the cache: the user may have rated while the judge was running.
      queryClient.setQueryData<RunDetail>(queryKeys.run(judged.id), (cached) =>
        cached
          ? {
              ...judged,
              responses: judged.responses.map((r) => {
                const current = cached.responses.find((c) => c.id === r.id)
                return current ? { ...r, rating: current.rating, isWinner: current.isWinner } : r
              }),
            }
          : judged,
      )
      invalidateLists()
    },
    onError: (error) => toast.error(`AI judge failed: ${error.message}`),
  })
}

export function useRateResponse(runId: string) {
  const { optimistic, resync, invalidateLists } = useRunCache()
  return useMutation({
    scope: { id: `feedback:${runId}` }, // run feedback mutations for one run in click order
    mutationFn: (data: { responseId: string; rating: number | null }) => rateResponse({ data }),
    onMutate: ({ responseId, rating }) =>
      optimistic(runId, (run) => ({
        ...run,
        responses: run.responses.map((r) => (r.id === responseId ? { ...r, rating } : r)),
      })),
    onError: (error) => {
      void resync(runId)
      notifyError(error)
    },
    onSettled: invalidateLists,
  })
}

export function useSetWinner(runId: string) {
  const { optimistic, resync, invalidateLists } = useRunCache()
  return useMutation({
    scope: { id: `feedback:${runId}` }, // run feedback mutations for one run in click order
    mutationFn: (data: { responseId: string; isWinner: boolean }) => setWinner({ data }),
    onMutate: ({ responseId, isWinner }) =>
      optimistic(runId, (run) => ({
        ...run,
        responses: run.responses.map((r) => ({ ...r, isWinner: r.id === responseId ? isWinner : false })),
      })),
    onError: (error) => {
      void resync(runId)
      notifyError(error)
    },
    onSettled: invalidateLists,
  })
}

export function useSetRunSharing() {
  const { update, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: { id: string; shared: boolean }) => setRunSharing({ data }),
    onSuccess: ({ id, shareSlug }) => {
      update(id, (run) => ({ ...run, shareSlug }))
      invalidateLists()
    },
    onError: notifyError,
  })
}

export function useDeleteRun() {
  const { queryClient, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: { id: string }) => deleteRun({ data }),
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: queryKeys.run(id) })
      invalidateLists()
      toast.success('Run deleted')
    },
    onError: notifyError,
  })
}
