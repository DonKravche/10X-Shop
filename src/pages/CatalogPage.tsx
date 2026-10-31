import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import CategoryCard from '../components/catalog/CategoryCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'
import ProductGrid from '../components/product/ProductGrid'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import StateMessage from '../components/ui/StateMessage'
import { fetchCatalog, fetchCategories, fetchCategoryShowcase } from '../api/products.api'
import { useCart } from '../context/cart-context'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../context/toast-context'
import type { AsyncState, CatalogParams } from '../types/api'
import type { Category, CategoryShowcase, Product, ProductsResponse } from '../types/product'
import { describeRange, isSortOption, totalPages } from '../utils/url'
import { discountedPrice } from '../utils/format'

/** P2.4: one request after a pause, not one per keystroke. */
const SEARCH_DEBOUNCE_MS = 400

/**
 * Reads the four catalogue parameters out of the URL (Annex A, P2.8).
 *
 * Anything malformed falls back to its default rather than reaching the API:
 * `?page=abc` is a page number nobody can honour, and `?sort=nonsense` is not
 * one of the five choices, so both are simply ignored.
 */
function readParams(search: URLSearchParams): CatalogParams {
  const page = Number(search.get('page'))
  const sort = search.get('sort') ?? ''

  return {
    q: search.get('q') ?? '',
    category: search.get('category') ?? '',
    sort: isSortOption(sort) ? sort : '',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

/**
 * Annex A, P2. The catalogue.
 *
 * The URL is the state (P2.8). The component reads the four parameters from
 * `useSearchParams`, builds a request from them and renders the answer —
 * which is what makes refresh, Back, Forward and a pasted link all work
 * without a line of code for any of them.
 */
export default function CatalogPage() {
  const [search, setSearch] = useSearchParams()
  const params = useMemo(() => readParams(search), [search])

  const [categories, setCategories] = useState<Category[]>([])
  const [showcase, setShowcase] = useState<CategoryShowcase[]>([])
  // Counts retries so the effect can be asked to run again without any
  // parameter having changed.
  const [attempt, setAttempt] = useState(0)

  /**
   * Names the request these parameters imply, so a stored answer can be
   * matched against the question currently being asked.
   */
  const requestKey = `${params.q}|${params.category}|${params.sort}|${params.page}|${attempt}`

  const [result, setResult] = useState<{
    key: string
    state: AsyncState<ProductsResponse>
  } | null>(null)

  /**
   * Loading is derived, not stored. Setting a `loading` flag inside the
   * effect would mean rendering once with stale data and again with the flag,
   * which is the cascading render `react-hooks/set-state-in-effect` warns
   * about. Instead: if the answer on hand is not an answer to this question,
   * the question is still open.
   *
   * Memoised because the loading branch builds a fresh object: without it
   * this would be a new value on every render and the sort below would
   * recompute each time, which is exactly what the memo is there to avoid.
   */
  const state: AsyncState<ProductsResponse> = useMemo(
    () =>
      result !== null && result.key === requestKey
        ? result.state
        : { status: 'loading' },
    [result, requestKey],
  )

  // The box holds what is being typed; the URL holds what is being searched
  // for. Without the local copy the input would wait 400ms for every letter.
  const [queryInput, setQueryInput] = useState(params.q)
  const [lastUrlQuery, setLastUrlQuery] = useState(params.q)
  const debouncedQuery = useDebounce(queryInput, SEARCH_DEBOUNCE_MS)

  // Back and Forward change the URL without touching the box, so the box has
  // to follow. Adjusting during render rather than in an effect: React
  // re-runs this component immediately with the corrected value and never
  // commits the stale one to the screen.
  if (lastUrlQuery !== params.q) {
    setLastUrlQuery(params.q)
    setQueryInput(params.q)
  }

  const { addItem } = useCart()
  const { showToast } = useToast()

  /**
   * Writes the next set of parameters into the URL, dropping any that are at
   * their default so the address stays readable.
   */
  const updateParams = useCallback(
    (next: Partial<CatalogParams>) => {
      const merged = { ...params, ...next }
      const query = new URLSearchParams()
      if (merged.q !== '') query.set('q', merged.q)
      if (merged.category !== '') query.set('category', merged.category)
      if (merged.sort !== '') query.set('sort', merged.sort)
      if (merged.page > 1) query.set('page', String(merged.page))
      setSearch(query)
    },
    [params, setSearch],
  )

  // The debounced text reaching the URL. Searching clears the category - the
  // API has no endpoint that does both (A1.6) - and returns to page 1,
  // because page 7 of the old results means nothing for a new query.
  useEffect(() => {
    // Only once the box has settled. While a debounce is still in flight the
    // debounced value is the *previous* text, and publishing it would undo
    // whatever the shopper has just done: choosing a category or clearing the
    // filters would be reverted 400ms later by a query they had moved on from.
    if (debouncedQuery !== queryInput) return
    if (debouncedQuery === params.q) return
    updateParams({ q: debouncedQuery, category: '', page: 1 })
  }, [debouncedQuery, queryInput, params.q, updateParams])

  useEffect(() => {
    const controller = new AbortController()

    fetchCatalog(params, controller.signal)
      .then((data) => setResult({ key: requestKey, state: { status: 'success', data } }))
      .catch((error: unknown) => {
        // An abort is this effect's own cleanup, not a failure to report.
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'The request failed.',
          },
        })
      })

    // P2.2: the request in flight is abandoned the moment its answer stops
    // being wanted, so a slow early response cannot overwrite a newer one.
    return () => controller.abort()
  }, [params, requestKey])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategories(controller.signal)
      .then(setCategories)
      // The filter is an enhancement; losing it must not break the page.
      .catch(() => undefined)

    fetchCategoryShowcase(controller.signal)
      .then(setShowcase)
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  function handleAdd(product: Product) {
    const added = addItem(product, 1)
    showToast(
      added > 0 ? 'Added to cart ✓' : 'That is all the stock we have', // taste-skill-ignore: P2 fixes this string
      added > 0 ? 'success' : 'error',
    )
  }

  /**
   * The page's products, re-ordered when sorting by price.
   *
   * DummyJSON honours `sortBy=price` — but it sorts by the *list* price,
   * while every card shows the *discounted* one. Those two orders are not the
   * same: 0.79 and 0.99 arrive in that order and display as $0.71 and $0.84,
   * so "Price: low to high" produces visibly unsorted figures.
   *
   * This is a compromise and not a fix, in the sense P2.6 means. It orders
   * the twelve products on this page by what the shopper can actually read,
   * which is what makes the control look like it works. It cannot order the
   * other 182: the server chose which twelve to send, using the other price.
   * Sorting the whole catalogue correctly would mean fetching all of it, and
   * O1 is explicit that 194 products are never loaded at once.
   */
  const products = useMemo(() => {
    const list = state.status === 'success' ? state.data.products : []
    if (params.sort !== 'price-asc' && params.sort !== 'price-desc') return list

    const direction = params.sort === 'price-asc' ? 1 : -1
    return [...list].sort(
      (a, b) =>
        direction *
        (discountedPrice(a.price, a.discountPercentage) -
          discountedPrice(b.price, b.discountPercentage)),
    )
  }, [state, params.sort])

  const total = state.status === 'success' ? state.data.total : 0
  const hasFilters = params.q !== '' || params.category !== '' || params.sort !== ''

  return (
    <Container className="flex flex-1 flex-col py-8">
      <PageHeader
        title="Catalog"
        description={
          state.status === 'success'
            ? describeRange(params.page, products.length, total)
            : undefined
        }
      />

      {/*
        Categories come before the products, as a shopper who does not know
        what they want needs a way in before a grid of 194 things. Picking one
        writes ?category= - the same URL the select writes - so this is a
        second door onto one mechanism, not a second mechanism.

        Hidden once a category or a query is active: at that point the strip
        is no longer a way in, it is a row of pictures competing with the
        results the shopper asked for.
      */}
      {showcase.length > 0 && params.category === '' && params.q === '' ? (
        <section aria-labelledby="browse-heading" className="mb-10">
          <h2 id="browse-heading" className="mb-4 text-base font-medium text-ink">
            Browse by category
          </h2>
          <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {showcase.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} size="sm" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CatalogToolbar
        query={queryInput}
        onQueryChange={setQueryInput}
        categories={categories}
        category={params.category}
        onCategoryChange={(category) =>
          // Choosing a category clears the query, for the same reason as above.
          updateParams({ category, q: '', page: 1 })
        }
        sort={params.sort}
        onSortChange={(sort) => updateParams({ sort, page: 1 })}
      />

      {state.status === 'loading' ? (
        <>
          <p role="status" className="sr-only">
            Loading products
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }, (_, index) => (
              <li key={index} className="flex">
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {state.status === 'error' ? (
        <StateMessage
          fill
          tone="error"
          title="We could not load the products"
          description={state.message}
        >
          <Button onClick={() => setAttempt((count) => count + 1)}>Retry</Button>
        </StateMessage>
      ) : null}

      {state.status === 'success' && products.length === 0 ? (
        <StateMessage
          fill
          title="No products found."
          description={
            hasFilters ? 'Nothing matches those filters.' : 'The catalogue is empty.'
          }
        >
          {hasFilters ? (
            <Button variant="secondary" onClick={() => setSearch(new URLSearchParams())}>
              Clear filters
            </Button>
          ) : null}
        </StateMessage>
      ) : null}

      {state.status === 'success' && products.length > 0 ? (
        <>
          <ProductGrid products={products} onAdd={handleAdd} />
          <Pagination
            page={params.page}
            totalPages={totalPages(total)}
            onChange={(page) => updateParams({ page })}
          />
        </>
      ) : null}
    </Container>
  )
}
