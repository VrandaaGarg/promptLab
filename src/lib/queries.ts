import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getInsights } from '@/server/insights'
import { getRun, getSharedRun, listRuns, type ListRunsInput } from '@/server/runs'
import { getCurrentUser } from '@/server/session'
import { listStrategies } from '@/server/strategies'
import type { TaskCategory } from './domain'
import type { ModelId } from './models'

export const queryKeys = {
  session: ['session'] as const,
  strategies: ['strategies'] as const,
  runs: ['runs'] as const,
  runList: (params: ListRunsInput) => ['runs', 'list', params] as const,
  run: (id: string) => ['runs', 'detail', id] as const,
  sharedRun: (slug: string) => ['shared-run', slug] as const,
  insights: (params: InsightsParams) => ['insights', params] as const,
}

export type InsightsParams = { model?: ModelId; category?: TaskCategory }

export const sessionQuery = () =>
  queryOptions({
    queryKey: queryKeys.session,
    queryFn: () => getCurrentUser(),
    staleTime: 30_000,
  })

export const strategiesQuery = () =>
  queryOptions({
    queryKey: queryKeys.strategies,
    queryFn: () => listStrategies(),
    staleTime: 5 * 60_000,
  })

export const runQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.run(id),
    queryFn: () => getRun({ data: { id } }),
  })

export const runListQuery = (params: ListRunsInput) =>
  queryOptions({
    queryKey: queryKeys.runList(params),
    queryFn: () => listRuns({ data: params }),
    placeholderData: keepPreviousData,
  })

export const sharedRunQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.sharedRun(slug),
    queryFn: () => getSharedRun({ data: { slug } }),
    staleTime: 5 * 60_000,
  })

export const insightsQuery = (params: InsightsParams) =>
  queryOptions({
    queryKey: queryKeys.insights(params),
    queryFn: () => getInsights({ data: params }),
    placeholderData: keepPreviousData,
  })
