import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Annex A, P0.1: a route change must start the new page at the top.
 *
 * Without this the browser keeps the previous scroll offset, so opening a
 * product from halfway down the catalogue lands mid-page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
