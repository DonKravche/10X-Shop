import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from '../components/catalog/CategoryCard'
import Container from '../components/ui/Container'
import { ArrowRightIcon } from '../components/ui/icons'
import { fetchStorefront } from '../api/products.api'
import type { AsyncState } from '../types/api'
import type { Storefront } from '../api/products.api'

/**
 * The landing page.
 *
 * Direction: "The contact sheet" (taste-skill, seed 1195433003) — show
 * everything at once, small, in order, and let the visitor do the choosing.
 *
 * The idea is the shop's own stock: 194 products, every one photographed
 * square on white, across 24 categories with nothing in common. A shop with
 * fifty thousand products could not put its whole range on one screen; this
 * one has a number you can actually show, so the range *is* the argument for
 * browsing. Nothing is featured, which is the point.
 *
 * The pictures are the shop's real product photographs from the API, not
 * stock imagery: the direction sheet assumed no product photography existed,
 * and here it does, which is the first preference in the skill's own order.
 *
 * It still loads products from DummyJSON on open, so the CORE Measurable
 * Outcome that the catalogue's data works is satisfied from the first screen.
 */
export default function LandingPage() {
  const [state, setState] = useState<AsyncState<Storefront>>({ status: 'loading' })
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchStorefront(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'The request failed.',
        })
      })

    return () => controller.abort()
  }, [])

  const data = state.status === 'success' ? state.data : null

  /** The two figures the first screen states, counted rather than claimed. */
  const totals = useMemo(() => {
    if (data === null) return { products: 0, categories: 0 }
    return {
      products: data.categories.reduce((sum, entry) => sum + entry.count, 0),
      categories: data.categories.length,
    }
  }, [data])

  return (
    <>
      {/*
        The text band of the hero blueprint: everything at one size, hanging
        from the top, with no display type above it. The sheet starts inside
        the first screen.
      */}
      <section className="border-b border-line bg-surface">
        <Container className="py-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h1 className="text-base font-medium text-ink">10X Shop</h1>
              <p className="mt-1 text-base text-muted">
                A demo storefront. Everything on it is real except the money.
              </p>
            </div>

            <div>
              <p className="text-base text-muted">In stock right now</p>
              <p className="mt-1 text-base tabular-nums text-ink">
                {state.status === 'success'
                  ? `${totals.products} products · ${totals.categories} categories`
                  : 'Loading the catalogue…'}
              </p>
            </div>

            <div className="text-base text-muted">
              <p>Browse by category, or search the lot.</p>
              <p className="mt-1">Nothing is charged and no order is sent.</p>
            </div>

            <div className="flex items-start sm:justify-end">
              <Link
                to="/catalog"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Open the catalog
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/*
        The sheet. A dense run of the shop's real product photographs at one
        small size, edge to edge, so the first thing the visitor sees is the
        range itself rather than a chosen hero product.
      */}
      <section aria-labelledby="sheet-heading" className="border-b border-line">
        <Container className="py-10">
          <h2 id="sheet-heading" className="sr-only">
            A sample of the stock
          </h2>

          {state.status === 'loading' ? (
            <div
              aria-hidden="true"
              className="grid animate-pulse grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16"
            >
              {Array.from({ length: 48 }, (_, index) => (
                <div key={index} className="aspect-square rounded-sm bg-ground" />
              ))}
            </div>
          ) : null}

          {state.status === 'error' ? (
            <p role="status" className="text-sm text-red-700 dark:text-red-400">
              The catalogue did not load. {state.message}
            </p>
          ) : null}

          {data !== null ? (
            <ul className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16">
              {data.sheet.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    onMouseEnter={() => setHovered(product.title)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(product.title)}
                    onBlur={() => setHovered(null)}
                    className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      width={200}
                      height={200}
                      loading="lazy"
                      className="aspect-square w-full bg-surface object-contain p-1.5 transition-opacity hover:opacity-70"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {/*
            The live thing: the sheet names what you are pointing at, in one
            fixed place, so the frames themselves need no captions. Reserved
            height, so nothing moves when the line appears.
          */}
          <p className="mt-3 min-h-5 text-[13px] text-muted">
            {hovered ?? (data !== null ? 'Point at anything to see what it is.' : '')}
          </p>
        </Container>
      </section>

      {/* Categories, each shown by a product from inside it. */}
      <section aria-labelledby="categories-heading">
        <Container className="py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2
              id="categories-heading"
              className="text-2xl font-bold tracking-tight text-ink"
            >
              Every category
            </h2>
            <Link
              to="/catalog"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              See all {totals.products} products
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          {data !== null ? (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {data.categories.map((category) => (
                <li key={category.slug}>
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      {/* The close: one sentence, one action. */}
      <section className="border-t border-line bg-surface">
        <Container className="py-14">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-prose text-2xl font-bold tracking-tight text-ink">
              {totals.products > 0
                ? `${totals.products} products, nothing to pay.`
                : 'Nothing to pay.'}
            </p>
            <Link
              to="/catalog"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Start browsing
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
