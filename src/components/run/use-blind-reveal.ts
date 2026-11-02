import { useMemo, useState } from 'react'
import { isInFlight } from '@/lib/domain'
import type { RunResponse } from '@/server/runs'
import type { ResponseIdentity } from './types'

/**
 * Blind mode hides strategy names (and judge scores) until the owner has rated every
 * completed response or chooses to reveal. Responses are shown in a stable order that
 * doesn't follow strategy order, so position gives nothing away.
 */
export function useBlindReveal({
  blindMode,
  responses,
  editable,
}: {
  blindMode: boolean
  responses: RunResponse[]
  editable: boolean
}) {
  const [revealedManually, setRevealedManually] = useState(false)
  const blind = blindMode && editable

  const ordered = useMemo(
    () => (blind ? [...responses].sort((a, b) => a.id.localeCompare(b.id)) : responses),
    [blind, responses],
  )

  const done = responses.filter((r) => r.status === 'done')
  const allRated = done.length > 0 && !responses.some(isInFlight) && done.every((r) => r.rating !== null)
  const hidden = blind && !revealedManually && !allRated

  const identities = useMemo(() => {
    const map = new Map<string, ResponseIdentity>()
    ordered.forEach((r, i) => map.set(r.id, { hidden, letter: String.fromCharCode(65 + i) }))
    return map
  }, [ordered, hidden])

  return {
    /** Blind mode is active for this viewer (it may already be revealed). */
    blind,
    hidden,
    ordered,
    ratedCount: done.filter((r) => r.rating !== null).length,
    doneCount: done.length,
    identityOf: (id: string): ResponseIdentity => identities.get(id) ?? { hidden, letter: '?' },
    reveal: () => setRevealedManually(true),
  }
}
