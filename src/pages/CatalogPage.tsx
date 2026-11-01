import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import CatalogSearch from '../components/catalog/CatalogSearch'
import CategoryCard from '../components/catalog/CategoryCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'
import ProductGrid from '../components/product/ProductGrid'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import StateMessage from '../components/ui/StateMessage'
import { ArrowRightIcon } from '../components/ui/icons'
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

  /**
   * The catalogue has two states.
   *
   * With nothing asked for it is the departments: a shopper who does not yet
   * know what they want is better served by twenty-four doors than by a grid
   * of 194 things whose first page is all cosmetics. Choosing a department -
   * or searching, or sorting - is what asks a question, and then the page
   * answers it with products.
   *
   * `/catalog` still calls the products endpoint in that state: the count
   * under every department is read from the stock itself, not claimed.
   *
   * A page number counts as asking too, so a shared link to page 2 of the
   * whole catalogue opens on page 2 rather than on the departments.
   */
  const showingDepartments = !hasFilters && params.page === 1

  /** The department being shown, for the heading and the count. */
  const openDepartment = showcase.find((entry) => entry.slug === params.category)

  return (
    <Container className="flex flex-1 flex-col py-8">
      {showingDepartments ? (
        <PageHeader
          title="Browse by department"
          description={
            showcase.length > 0
              ? `${showcase.length} departments · ${showcase.reduce(
                  (sum, entry) => sum + entry.count,
                  0,
                )} products`
              : undefined
          }
        />
      ) : (
        <PageHeader
          title={openDepartment?.name ?? 'Catalog'}
          description={
            state.status === 'success'
              ? describeRange(params.page, products.length, total)
              : undefined
          }
        />
      )}

      {/* A way back out of a department, in the place a reader looks for it. */}
      {!showingDepartments ? (
        <button
          type="button"
          onClick={() => setSearch(new URLSearchParams())}
          className="mb-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ArrowRightIcon size={16} className="rotate-180" />
          All departments
        </button>
      ) : null}

      {/*
        The departments. Every one of them, not a strip of eight: this is the
        whole way in now, so leaving sixteen of them off the page would hide
        most of the shop behind a select.

        The search field above them is the way in for a shopper who already
        knows the word. It is `md:hidden` because from 768px the header is
        showing the same box, and two fields with the same label on one screen
        is a duplicate, not a convenience.
      */}
      {showingDepartments ? (
        <>
          <div className="mb-8 max-w-md md:hidden">
            <CatalogSearch query={queryInput} onQueryChange={setQueryInput} />
          </div>

          {showcase.length === 0 ? (
            <StateMessage
              fill
              title={state.status === 'error' ? 'We could not load the departments' : 'Loading departments...'}
              description={state.status === 'error' ? state.message : undefined}
            >
              {state.status === 'error' ? (
                <Button onClick={() => setAttempt((count) => count + 1)}>Retry</Button>
              ) : null}
            </StateMessage>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {showcase.map((category) => (
                <li key={category.slug}>
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {!showingDepartments ? (
        <>
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
        </>
      ) : null}
    </Container>
  )
}
