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

  const update = (runId: string, fn: (run: RunDetail) => RunDetail) => {
    const key = queryKeys.run(runId)
    const previous = queryClient.getQueryData<RunDetail>(key)
    if (previous) queryClient.setQueryData<RunDetail>(key, fn(previous))
    return () => queryClient.setQueryData(key, previous)
  }

  const invalidateLists = () => {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.runs, 'list'] })
    void queryClient.invalidateQueries({ queryKey: ['insights'] })
  }

  return { queryClient, update, invalidateLists }
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
    onSuccess: (run) => {
      queryClient.setQueryData(queryKeys.run(run.id), run)
      invalidateLists()
    },
    onError: (error) => toast.error(`AI judge failed: ${error.message}`),
  })
}

export function useRateResponse(runId: string) {
  const { update, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: { responseId: string; rating: number | null }) => rateResponse({ data }),
    onMutate: ({ responseId, rating }) =>
      update(runId, (run) => ({
        ...run,
        responses: run.responses.map((r) => (r.id === responseId ? { ...r, rating } : r)),
      })),
    onError: (error, _vars, rollback) => {
      rollback?.()
      notifyError(error)
    },
    onSettled: invalidateLists,
  })
}

export function useSetWinner(runId: string) {
  const { update, invalidateLists } = useRunCache()
  return useMutation({
    mutationFn: (data: { responseId: string; isWinner: boolean }) => setWinner({ data }),
    onMutate: ({ responseId, isWinner }) =>
      update(runId, (run) => ({
        ...run,
        responses: run.responses.map((r) => ({ ...r, isWinner: r.id === responseId ? isWinner : false })),
      })),
    onError: (error, _vars, rollback) => {
      rollback?.()
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
