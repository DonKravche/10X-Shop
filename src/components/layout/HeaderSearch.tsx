import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon } from '../ui/icons'
import { useDebounce } from '../../hooks/useDebounce'

/**
 * Search from anywhere (Annex A, P2.4 extended to the header).
 *
 * It does not search here; it hands the query to the catalogue by putting it
 * in the URL, which is where the catalogue's state lives (P2.8). That means
 * one implementation of search, not two, and the result is a shareable
 * address like any other catalogue view.
 *
 * Hidden below 768px, where the catalogue shows the same field on the page
 * instead. Exactly one search box is on screen at any width: a second one
 * saying the same words is noise, and on a phone it would cost a third of the
 * screen to duplicate a control the shopper already has.
 *
 * On the catalogue it *is* the catalogue's search box, so it behaves like one:
 * it shows whatever the URL is currently asking for, and it publishes what is
 * typed through the same 400ms debounce as P2.4 requires, rather than waiting
 * for Enter. Anywhere else there is nothing to filter yet, so it waits for
 * Enter and takes the shopper to the catalogue.
 */
export default function HeaderSearch() {
  const { pathname } = useLocation()
  const [search] = useSearchParams()
  const navigate = useNavigate()

  const onCatalog = pathname === '/catalog'
  const urlQuery = onCatalog ? (search.get('q') ?? '') : ''

  const [query, setQuery] = useState(urlQuery)
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)
  const debouncedQuery = useDebounce(query, 400)

  // The URL can change without this box being touched - Back, a shared link,
  // Clear filters, or leaving the catalogue. Adopting it during render rather
  // than in an effect means React re-runs with the corrected value and never
  // paints the stale one.
  if (lastUrlQuery !== urlQuery) {
    setLastUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

  /**
   * The address this query asks for.
   *
   * Searching clears the category, because the API has no endpoint that
   * filters and searches at once (A1.6), and drops the page, because page 7
   * of the old results means nothing for a new query. The sort survives: it
   * is how the shopper wants to read any results, not which ones they want.
   */
  const catalogHref = useCallback((text: string) => {
    const next = new URLSearchParams()
    if (text !== '') next.set('q', text)

    const sort = onCatalog ? search.get('sort') : null
    if (sort !== null && sort !== '') next.set('sort', sort)

    const queryString = next.toString()
    return queryString === '' ? '/catalog' : `/catalog?${queryString}`
  }, [onCatalog, search])

  useEffect(() => {
    if (!onCatalog) return
    // While a debounce is still in flight the settled value is the *previous*
    // text; publishing it would undo whatever has just been done elsewhere.
    if (debouncedQuery !== query) return
    if (debouncedQuery === urlQuery) return
    // `replace`, so typing a word does not bury the page it was typed from
    // under one history entry per pause.
    navigate(catalogHref(debouncedQuery), { replace: true })
  }, [onCatalog, debouncedQuery, query, urlQuery, navigate, catalogHref])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // On the catalogue the debounce has already published it; this only makes
    // Enter feel like it did something immediate.
    navigate(catalogHref(query.trim()))
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm"
    >
      <label htmlFor="header-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        {/* The icon sits inside the field rather than beside it, so the whole
            width stays clickable and the control reads as one thing. */}
        <SearchIcon
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          id="header-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="min-h-11 w-full rounded-md border border-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink transition-colors placeholder:text-subtle hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </div>
    </form>
  )
}
