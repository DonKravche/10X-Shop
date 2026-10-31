import { useEffect, useState } from 'react'

/**
 * The current time, refreshed on an interval (Annex A, P6.2).
 *
 * Order status is a pure function of "now", so the only thing that has to
 * change for an order to move from Processing to Shipped is this value. That
 * keeps the clock in one hook instead of a timer in every component that
 * shows a status.
 *
 * The interval is cleared on unmount. Without that cleanup the timer would
 * keep firing after the page is gone, holding the component in memory and
 * setting state on something React has already thrown away - the question
 * P6.2 says to be ready for at the defence.
 */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
