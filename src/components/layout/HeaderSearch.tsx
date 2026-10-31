import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon } from '../ui/icons'

/**
 * Search from anywhere (Annex A, P2.4 extended to the header).
 *
 * It does not search here; it hands the query to the catalogue by putting it
 * in the URL, which is where the catalogue's state lives (P2.8). That means
 * one implementation of search, not two, and the result is a shareable
 * address like any other catalogue view.
 *
 * Hidden below 768px. The catalogue has its own search field, so a second one
 * on a phone would cost a third of the screen to duplicate it; the header
 * there keeps the room for navigation instead.
 */
export default function HeaderSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = query.trim()
    navigate(trimmed === '' ? '/catalog' : `/catalog?q=${encodeURIComponent(trimmed)}`)
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
