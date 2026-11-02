import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queries'
import type { StrategyInput } from '@/lib/validation'
import { createStrategy, deleteStrategy, updateStrategy } from '@/server/strategies'

function useInvalidateStrategies() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.strategies })
}

const notifyError = (error: Error) => toast.error(error.message)

export function useCreateStrategy() {
  const invalidate = useInvalidateStrategies()
  return useMutation({
    mutationFn: (data: StrategyInput) => createStrategy({ data }),
    onSuccess: async (strategy) => {
      await invalidate()
      toast.success(`Created “${strategy.name}”`)
    },
    onError: notifyError,
  })
}

export function useUpdateStrategy() {
  const invalidate = useInvalidateStrategies()
  return useMutation({
    mutationFn: (data: StrategyInput & { id: string }) => updateStrategy({ data }),
    onSuccess: async (strategy) => {
      await invalidate()
      toast.success(`Saved “${strategy.name}”`)
    },
    onError: notifyError,
  })
}

export function useDeleteStrategy() {
  const invalidate = useInvalidateStrategies()
  return useMutation({
    mutationFn: (data: { id: string }) => deleteStrategy({ data }),
    onSuccess: async () => {
      await invalidate()
      toast.success('Strategy deleted')
    },
    onError: notifyError,
  })
}
