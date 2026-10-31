import { useEffect, useState } from 'react'

/**
 * The value, but only once it has stopped changing for `delay` (Annex A, P2.4).
 *
 * Typing "phone" is five state changes. Without this each one would start a
 * request, four of which are already obsolete by the time they are answered.
 * The input itself stays bound to the immediate value so it never feels slow;
 * only the thing that *acts* on it waits.
 *
 * The cleanup is what makes it work: each render schedules a timer and the
 * next keystroke cancels it before it fires, so the value is only published
 * after a real pause.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return settled
}
