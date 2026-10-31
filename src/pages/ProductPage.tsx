import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductGallery from '../components/product/ProductGallery'
import ProductGrid from '../components/product/ProductGrid'
import ProductPrice from '../components/product/ProductPrice'
import ReviewForm from '../components/product/ReviewForm'
import ReviewList from '../components/product/ReviewList'
import StarRating from '../components/product/StarRating'
import StockBadge from '../components/product/StockBadge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import QuantityStepper from '../components/ui/QuantityStepper'
import StateMessage from '../components/ui/StateMessage'
import { fetchProductById, fetchRelated } from '../api/products.api'
import { isApiError } from '../api/ApiError'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import { useToast } from '../context/toast-context'
import { reviewStorage } from '../models/storage'
import type { Product, Review } from '../types/product'
import NotFoundPage from './NotFoundPage'

type Status = 'loading' | 'success' | 'error' | 'not-found'
type Tab = 'description' | 'reviews'

/** Reviews written in this browser for one product, newest first. */
function readLocalReviews(productId: number): Review[] {
  const all = reviewStorage.get()
  if (all === null) return []
  const forProduct = all[productId]
  return Array.isArray(forProduct) ? forProduct : []
}

/**
 * Annex A, P3. One product, loaded by the id in the URL.
 *
 * This component only validates the id. `/products/abc` is not a product that
 * failed to load, it is not a product at all, so it is answered with the Not
 * found page without touching the network (P3.2).
 *
 * Keying ProductDetails by the id remounts it when the route moves to another
 * product, which resets the chosen thumbnail, the quantity and the open tab
 * along with it.
 */
export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  if (!Number.isInteger(productId) || productId <= 0) {
    return <NotFoundPage />
  }

  return <ProductDetails productId={productId} key={productId} />
}

interface ProductDetailsProps {
  productId: number
}

function ProductDetails({ productId }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<Tab>('description')
  const [related, setRelated] = useState<Product[]>([])
  const [localReviews, setLocalReviews] = useState<Review[]>(() =>
    readLocalReviews(productId),
  )

  const { addItem } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    const controller = new AbortController()

    fetchProductById(productId, controller.signal)
      .then((result) => {
        setProduct(result)
        setStatus('success')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // A product that does not exist is not a failure to load one: 404
        // gets the Not found page, everything else gets a retryable error.
        setStatus(isApiError(error) && error.status === 404 ? 'not-found' : 'error')
      })

    return () => controller.abort()
    // `productId` is in the dependency list, so moving from one product to
    // another refetches. Without it the URL would change and the data would
    // not (P3.2).
  }, [productId])

  // Related products wait for the product, because its category is the query
  // (P3.5). Their own failure is silent: this block is an extra, and losing
  // it must not take the page with it.
  const category = product?.category
  useEffect(() => {
    if (category === undefined) return
    const controller = new AbortController()
    fetchRelated(category, productId, controller.signal)
      .then(setRelated)
      .catch(() => undefined)
    return () => controller.abort()
  }, [category, productId])

  /**
   * Local reviews first, newest at the top, then the ones the API returned
   * (P3.4). Local ones are already stored newest-first, so no sort is needed.
   */
  const reviews = useMemo(
    () => [...localReviews, ...(product?.reviews ?? [])],
    [localReviews, product],
  )

  /**
   * The average across both sources (P3.4).
   *
   * Computed rather than read from `product.rating`, because a review written
   * here has to move the number - otherwise adding a one-star review would
   * leave the headline rating untouched and the page would contradict itself.
   */
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return product?.rating ?? 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews, product])

  const handleAddReview = useCallback(
    (review: Review) => {
      const all = reviewStorage.get() ?? {}
      const next = [review, ...readLocalReviews(productId)]
      reviewStorage.set({ ...all, [productId]: next })
      setLocalReviews(next)
      showToast('Review added ✓')
    },
    [productId, showToast],
  )

  const handleAdd = useCallback(
    (item: Product, howMany: number) => {
      const added = addItem(item, howMany)
      showToast(
        added > 0 ? 'Added to cart ✓' : 'That is all the stock we have',
        added > 0 ? 'success' : 'error',
      )
    },
    [addItem, showToast],
  )

  if (status === 'not-found') {
    return <NotFoundPage />
  }

  if (status === 'loading') {
    return (
      <Container className="flex flex-1 flex-col py-8">
        <StateMessage fill title="Loading product..." />
      </Container>
    )
  }

  if (status === 'error' || product === null) {
    return (
      <Container className="flex flex-1 flex-col py-8">
        <StateMessage
          fill
          tone="error"
          title="We could not load this product"
          description="The product service did not respond. Please check your connection and reload the page."
        >
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            Back to catalog
          </Link>
        </StateMessage>
      </Container>
    )
  }

  const isSoldOut = product.stock === 0

  const tabClass = (value: Tab): string =>
    [
      'min-h-11 border-b-2 px-1 text-sm transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
      tab === value
        ? 'border-neutral-950 font-medium text-neutral-950'
        : 'border-transparent text-neutral-500 hover:text-neutral-950',
    ].join(' ')

  return (
    <Container className="py-8">
      <Link
        to="/"
        className="mb-4 inline-flex min-h-11 items-center rounded-sm text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
      >
        &larr; Back to catalog
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          thumbnail={product.thumbnail}
          title={product.title}
        />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            {product.title}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {product.brand ? `${product.brand} · ` : ''}
            {/* The category links back into the filtered catalogue (P3.1). */}
            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="rounded-sm underline underline-offset-2 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
            >
              {product.category}
            </Link>
          </p>

          <div className="mt-6">
            <ProductPrice
              price={product.price}
              discountPercentage={product.discountPercentage}
              size="lg"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StarRating value={averageRating} />
            <span className="text-sm tabular-nums text-neutral-600">
              {averageRating.toFixed(1)}
            </span>
            <button
              type="button"
              onClick={() => setTab('reviews')}
              className="rounded-sm text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
            >
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </button>
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              max={Math.max(product.stock, 1)}
              onChange={setQuantity}
              label={product.title}
            />
            <Button
              disabled={isSoldOut}
              onClick={() => handleAdd(product, quantity)}
              className="min-w-40"
            >
              {isSoldOut ? 'Out of stock' : 'Add to cart'}
            </Button>
          </div>

          {isSoldOut ? (
            <p className="mt-4 text-sm text-neutral-500">
              This product is currently out of stock.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        <div role="tablist" className="flex gap-6 border-b border-neutral-200">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'description'}
            onClick={() => setTab('description')}
            className={tabClass('description')}
          >
            Description
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'reviews'}
            onClick={() => setTab('reviews')}
            className={tabClass('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {tab === 'description' ? (
          <p className="max-w-prose py-6 text-sm leading-relaxed text-neutral-700">
            {product.description}
          </p>
        ) : (
          <div className="max-w-2xl">
            <ReviewList reviews={reviews} />
            <ReviewForm
              // Signed in or not, a review needs a name against it (P3.4).
              reviewerName={user.isLoggedIn ? user.username : 'Guest'}
              onSubmit={handleAddReview}
            />
          </div>
        )}
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-lg font-bold tracking-tight text-neutral-950">
            More in {product.category}
          </h2>
          {/* The same ProductCard the catalogue uses - P2.3 names this as the
              evidence that the component really is reusable. */}
          <ProductGrid products={related} onAdd={(item) => handleAdd(item, 1)} />
        </section>
      ) : null}
    </Container>
  )
}
