import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** `false` during SSR and hydration, `true` afterwards. Use to gate client-only rendering. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
