import { useEffect, useRef } from 'react'

/** Returns a stable function that invokes the latest `callback` after `delay` ms of inactivity. */
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, delay: number) {
  const latest = useRef(callback)
  const delayRef = useRef(delay)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const debounced = useRef((...args: Args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => latest.current(...args), delayRef.current)
  })

  useEffect(() => {
    latest.current = callback
    delayRef.current = delay
  })
  useEffect(() => () => clearTimeout(timer.current), [])

  return debounced.current
}
