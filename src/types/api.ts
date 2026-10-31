/**
 * One shape for every asynchronous read (Annex A, T2).
 *
 * A discriminated union rather than three loose booleans: `loading`, `error`
 * and `data` as separate fields allow states that cannot happen - loading and
 * errored at once, successful with no data. Here `status` decides which other
 * fields exist, so `data` is only reachable once the request has succeeded and
 * TypeScript enforces the check.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

/** The five sort choices of P2.6. "" is the API's own order. */
export type SortOption = '' | 'price-asc' | 'price-desc' | 'rating-desc' | 'title-asc'

/**
 * Everything the catalogue reads from the URL (Annex A, P2.8).
 *
 * The URL is the single source of truth, so this is what one screen of the
 * catalogue *is*: a query, a category, an order and a page number.
 */
export interface CatalogParams {
  q: string
  category: string
  sort: SortOption
  page: number
}
