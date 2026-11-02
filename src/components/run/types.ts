import type { RunDetail } from '@/server/runs'

/** Run data as rendered by RunView; public shared runs omit the owner. */
export type RunViewData = Omit<RunDetail, 'userId' | 'judgeStartedAt'>

/** Live generation and judging state, only available to the run's owner. */
export type RunLiveState = {
  isStreaming: boolean
  isJudging: boolean
  judgeError: string | null
  runJudge: () => void
}

/** How a response is presented: either its strategy, or an anonymous letter in blind mode. */
export type ResponseIdentity = { hidden: boolean; letter: string }
