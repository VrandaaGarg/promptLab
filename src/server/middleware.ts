import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getAuth } from '@/lib/auth/server'

export type SessionUser = { id: string; name: string; email: string; image?: string | null }

export async function getSessionUser(headers: Headers): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers })
  if (!session) return null
  const { id, name, email, image } = session.user
  return { id, name, email, image }
}

/** Rejects unauthenticated calls and exposes `context.user` to server functions. */
export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getSessionUser(getRequestHeaders())
  if (!user) throw new Error('Unauthorized')
  return next({ context: { user } })
})
