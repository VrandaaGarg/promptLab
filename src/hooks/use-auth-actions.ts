import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { signOut } from '@/lib/auth/client'
import { safeRedirect } from '@/lib/auth/redirect'
import { queryKeys } from '@/lib/queries'

/** Refreshes the session in the router context, then continues to the requested page. */
export function useCompleteAuth(redirect: string | undefined) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useCallback(async () => {
    await queryClient.resetQueries({ queryKey: queryKeys.session })
    await router.invalidate()
    await router.navigate({ href: safeRedirect(redirect), replace: true })
  }, [queryClient, router, redirect])
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const run = useCallback(async () => {
    setPending(true)
    try {
      const { error } = await signOut()
      if (error) throw new Error(error.message ?? 'Could not sign out')
      // Drop every cached user-scoped query before leaving the authenticated area.
      queryClient.clear()
      await router.navigate({ to: '/' })
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out')
    } finally {
      setPending(false)
    }
  }, [queryClient, router])

  return { signOut: run, pending }
}
