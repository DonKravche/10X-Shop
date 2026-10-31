import type { CatalogParams, SortOption } from '../types/api'

/** Products shown per catalogue page (Annex A1.6). */
export const PRODUCTS_PER_PAGE = 12

/**
 * How each sort choice maps onto DummyJSON's parameters (Annex A, P2.6).
 *
 * Keyed by every SortOption except "", so adding a sixth choice to the union
 * makes this object fail to compile until it is handled here too.
 */
const SORT_PARAMS: Record<
  Exclude<SortOption, ''>,
  { sortBy: string; order: 'asc' | 'desc' }
> = {
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating-desc': { sortBy: 'rating', order: 'desc' },
  'title-asc': { sortBy: 'title', order: 'asc' },
}

/** True when the value is one of the five sort choices (Annex A, T3). */
export function isSortOption(value: string): value is SortOption {
  return value === '' || value in SORT_PARAMS
}

/**
 * Builds the path for one screen of the catalogue (Annex A, T3).
 *
 * Three endpoints answer the same shape, and which one is used depends on the
 * parameters: a query goes to /search, a category to /category/{slug}, and
 * neither to the plain list. Search and category are mutually exclusive
 * because the API has no endpoint that does both (A1.6), and the query wins.
 *
 * Pure and typed, so the whole of the catalogue's URL logic can be read in
 * one place instead of being spread through the component.
 */
export function buildProductsPath(params: CatalogParams): string {
  const search = new URLSearchParams()
  search.set('limit', String(PRODUCTS_PER_PAGE))
  search.set('skip', String((params.page - 1) * PRODUCTS_PER_PAGE))

  if (params.sort !== '') {
    const { sortBy, order } = SORT_PARAMS[params.sort]
    search.set('sortBy', sortBy)
    search.set('order', order)
  }

  if (params.q !== '') {
    search.set('q', params.q)
    return `/products/search?${search.toString()}`
  }

  if (params.category !== '') {
    return `/products/category/${encodeURIComponent(params.category)}?${search.toString()}`
  }

  return `/products?${search.toString()}`
}

/** Pages needed to hold `total` products (Annex A1.6). */
export function totalPages(total: number): number {
  return Math.max(Math.ceil(total / PRODUCTS_PER_PAGE), 1)
}

/** "Showing 13-24 of 194" (Annex A, P2.1). */
export function describeRange(page: number, shown: number, total: number): string {
  if (total === 0) return 'No products'
  const first = (page - 1) * PRODUCTS_PER_PAGE + 1
  return `Showing ${first}\u2013${first + shown - 1} of ${total}`
}
