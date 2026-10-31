import type { ChangeEvent } from 'react'
import type { Category } from '../../types/product'
import type { SortOption } from '../../types/api'

interface CatalogToolbarProps {
  /** The live text in the box, which is not yet the text being searched for. */
  query: string
  onQueryChange: (query: string) => void
  categories: Category[]
  category: string
  onCategoryChange: (slug: string) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
}

/** The five choices of P2.6, in the order the specification lists them. */
const SORT_CHOICES: { value: SortOption; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Rating: high to low' },
  { value: 'title-asc', label: 'Name A\u2192Z' },
]

const CONTROL =
  'min-h-11 w-full rounded-md border border-strong bg-surface px-3 text-sm ' +
  'text-ink transition-colors hover:border-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

/**
 * Search, category and sort (Annex A, P2.4-P2.6).
 *
 * A presentational component: it reports changes and renders what it is
 * given. The page owns the URL, which owns the state.
 */
export default function CatalogToolbar({
  query,
  onQueryChange,
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: CatalogToolbarProps) {
  function handleSort(event: ChangeEvent<HTMLSelectElement>) {
    // The select can only hold the five values above, so this cast is safe in
    // a way a cast on arbitrary input would not be.
    onSortChange(event.target.value as SortOption)
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <div>
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search products"
          className={`${CONTROL} placeholder:text-subtle`}
        />
      </div>

      <div>
        <label htmlFor="catalog-category" className="sr-only">
          Category
        </label>
        <select
          id="catalog-category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={CONTROL}
        >
          <option value="">All categories</option>
          {categories.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="catalog-sort" className="sr-only">
          Sort by
        </label>
        <select
          id="catalog-sort"
          value={sort}
          onChange={handleSort}
          className={CONTROL}
        >
          {SORT_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
