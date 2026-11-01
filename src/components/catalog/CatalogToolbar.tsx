import type { ChangeEvent } from 'react'
import type { Category } from '../../types/product'
import type { SortOption } from '../../types/api'
import CatalogSearch from './CatalogSearch'

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
 *
 * The search field is `md:hidden` because from 768px the header carries the
 * same box, bound to the same `?q=` and debounced the same way. Hiding it
 * removes the item from the grid altogether, so the row becomes category and
 * sort rather than two controls and a gap.
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
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:w-auto lg:grid-cols-[14rem_14rem]">
      <div className="sm:col-span-2 md:hidden">
        <CatalogSearch query={query} onQueryChange={onQueryChange} />
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
