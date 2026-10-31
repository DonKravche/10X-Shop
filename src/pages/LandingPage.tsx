import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from '../components/catalog/CategoryCard'
import ProductRun from '../components/landing/ProductRun'
import Container from '../components/ui/Container'
import { ArrowRightIcon } from '../components/ui/icons'
import { fetchStorefront } from '../api/products.api'
import type { Storefront } from '../api/products.api'
import type { AsyncState } from '../types/api'

/**
 * The landing page.
 *
 * Direction: "The page is the object" (taste-skill, seed 439475994, editorial
 * tone) — find the printed artefact that already exists in the subject's
 * world and build the page as that thing.
 *
 * The artefact a general store of 194 unalike goods would actually print is
 * its mail-order catalogue: a cover over a field of its own stock, an issue
 * line of real figures, runs of goods you read across a spread, and the
 * departments at the back. A shop that sells only shoes has no catalogue to
 * imitate — breadth is the whole reason one exists — which is what makes this
 * the shop's own idea rather than the category's.
 *
 * Two redraws, both stated: the sheet dealt a "Mountain" photograph set as
 * atmosphere, which has nothing to do with a general store, so the cover's
 * dim field is the shop's own 194 product photographs — preference (1) in the
 * skill's own order of imagery. And the dealt footer would replace the global
 * one, which belongs to the shared Layout, so the closing band is the close.
 *
 * It still loads real products from DummyJSON on open, so the CORE Measurable
 * Outcome that the catalogue's data works is satisfied from the first screen.
 */
export default function LandingPage() {
  const [state, setState] = useState<AsyncState<Storefront>>({ status: 'loading' })

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

  /** The issue line: figures counted from the stock, never claimed. */
  const issue = useMemo(() => {
    if (data === null) return null
    const products = data.categories.reduce((sum, entry) => sum + entry.count, 0)
    const deepest = data.reduced[0]
    return {
      products,
      departments: data.categories.length,
      deepest: deepest === undefined ? 0 : Math.round(deepest.discountPercentage),
    }
  }, [data])

  return (
    <>
      {/*
        The cover. A dim field of the shop's own goods, with the masthead
        panel over it — the collage of stock a catalogue puts on its front.
      */}
      <section className="relative isolate overflow-hidden border-b border-line bg-ink">
        {/* The field. aria-hidden: it is the cover's texture, and every one
            of these products is reachable by name further down the page. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-6 gap-px opacity-25 sm:grid-cols-10 lg:grid-cols-14"
        >
          {(data?.sheet ?? []).map((product) => (
            <img
              key={product.id}
              src={product.thumbnail}
              alt=""
              width={160}
              height={160}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>

        <Container className="relative py-16 sm:py-24">
          <div className="max-w-2xl bg-surface p-8 sm:p-12">
            {/* The three words of the masthead spread across the panel's top
                edge, so the name becomes the frame (the direction's move). */}
            <p className="flex justify-between gap-4 text-lg font-bold tracking-tight text-ink sm:text-2xl">
              <span>10X</span>
              <span>&mdash;</span>
              <span>SHOP</span>
            </p>

            <h1 className="mt-10 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              The whole shop, one issue.
            </h1>

            <p className="mt-6 max-w-prose text-base text-muted">
              Everything here is a real product with a real price. Nothing is
              charged, no order is sent, and no card is ever asked for.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/catalog"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Open the catalog
                <ArrowRightIcon size={16} />
              </Link>
              <p className="text-[13px] tabular-nums text-subtle">
                {issue === null
                  ? 'Counting the stock…'
                  : `No. 1 · ${issue.products} products · ${issue.departments} departments`}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* The issue in figures, spread like the line of times on a programme. */}
      <section aria-labelledby="issue-heading" className="border-b border-line">
        <Container className="py-12">
          <h2 id="issue-heading" className="sr-only">
            This issue in figures
          </h2>
          <dl className="flex flex-wrap justify-between gap-x-8 gap-y-8">
            <div>
              <dt className="text-3xl tabular-nums text-ink sm:text-4xl">
                {issue?.products ?? '—'}
              </dt>
              <dd className="mt-1 text-sm text-muted">products in stock</dd>
            </div>
            <div>
              <dt className="text-3xl tabular-nums text-ink sm:text-4xl">
                {issue?.departments ?? '—'}
              </dt>
              <dd className="mt-1 text-sm text-muted">departments, all unalike</dd>
            </div>
            <div>
              <dt className="text-3xl tabular-nums text-ink sm:text-4xl">
                {issue === null ? '—' : `${issue.deepest}%`}
              </dt>
              <dd className="mt-1 text-sm text-muted">the deepest reduction</dd>
            </div>
            <div>
              <dt className="text-3xl tabular-nums text-ink sm:text-4xl">$0</dt>
              <dd className="mt-1 text-sm text-muted">what any of it costs you</dd>
            </div>
          </dl>
        </Container>
      </section>

      {state.status === 'loading' ? (
        <Container className="py-16">
          <p role="status" className="text-sm text-muted">
            Loading this issue…
          </p>
        </Container>
      ) : null}

      {state.status === 'error' ? (
        <Container className="py-16">
          <p role="status" className="text-sm text-red-700 dark:text-red-400">
            The catalogue did not load. {state.message}
          </p>
        </Container>
      ) : null}

      {data !== null ? (
        <>
          {/* The runs. Both are the catalogue sorted, not a list somebody
              chose: "featured" on a shop usually means paid placement, and
              there is nobody here to pay. */}
          <Container className="divide-y divide-line">
            <ProductRun
              heading="Marked down hardest"
              note="The deepest reductions in the catalogue, steepest first."
              products={data.reduced}
            />
            <ProductRun
              heading="Rated highest"
              note="What the reviews in the catalogue actually rate best."
              products={data.rated}
              liftedIndex={2}
            />
          </Container>

          {/* The departments at the back of the book. */}
          <section aria-labelledby="departments-heading" className="border-t border-line">
            <Container className="py-14">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2
                  id="departments-heading"
                  className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
                >
                  Every department
                </h2>
                <Link
                  to="/catalog"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  See all {issue?.products ?? ''} products
                  <ArrowRightIcon size={16} />
                </Link>
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {data.categories.map((category) => (
                  <li key={category.slug}>
                    <CategoryCard category={category} />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </>
      ) : null}

      {/*
        The close: the whole band is the link and one verb fills it, which is
        the direction's cta blueprint. The accent here is the ink, because
        this palette's accent *is* the ink.
      */}
      <Link
        to="/catalog"
        // overflow-hidden does the cropping, as the direction's own blueprint
        // does it: the word is meant to be larger than its frame, and without
        // the clip its glyph overhang scrolled the whole page sideways by 7px,
        // which O3 forbids.
        className="group block overflow-hidden bg-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ink"
      >
        <Container className="py-16">
          <div className="flex items-start justify-between gap-6">
            <p className="max-w-xs text-base text-surface transition-colors group-hover:text-ink">
              No account needed, and nothing to pay.
            </p>
            <ArrowRightIcon
              size={40}
              className="shrink-0 -rotate-45 text-surface transition-colors group-hover:text-ink"
            />
          </div>
          <p className="mt-10 overflow-hidden text-[19vw] leading-[0.8] font-bold tracking-tighter whitespace-nowrap text-surface transition-colors group-hover:text-ink">
            BROWSE
          </p>
        </Container>
      </Link>
    </>
  )
}
