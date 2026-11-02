import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** True on Apple platforms after hydration; false on the server so markup matches. */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  )
}
