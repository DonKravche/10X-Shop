import { SearchIcon } from '../ui/icons'

interface CatalogSearchProps {
  /** The live text in the box, which is not yet the text being searched for. */
  query: string
  onQueryChange: (query: string) => void
}

/**
 * The catalogue's search field (Annex A, P2.4).
 *
 * Its own component because the catalogue shows it in two places: alone above
 * the departments, where searching is the alternative to picking one, and
 * inside the toolbar once a department or a query is open. One field, one
 * behaviour, two positions.
 */
export default function CatalogSearch({ query, onQueryChange }: CatalogSearchProps) {
  return (
    <div>
      <label htmlFor="catalog-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search products"
          className="min-h-11 w-full rounded-md border border-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink transition-colors placeholder:text-subtle hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </div>
    </div>
  )
}
