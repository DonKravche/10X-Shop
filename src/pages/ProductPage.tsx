import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductGallery from '../components/product/ProductGallery'
import ProductPrice from '../components/product/ProductPrice'
import StockBadge from '../components/product/StockBadge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import QuantityStepper from '../components/ui/QuantityStepper'
import StateMessage from '../components/ui/StateMessage'
import { fetchProductById } from '../api/products.api'
import { useCart } from '../context/cart-context'
import type { Product } from '../types/product'
import NotFoundPage from './NotFoundPage'

type Status = 'loading' | 'success' | 'error' | 'not-found'

/**
 * Annex A, P3. One product, loaded by the id in the URL.
 *
 * This component only validates the id. `/products/abc` is not a product that
 * failed to load, it is not a product at all, so it is answered with the Not
 * found page without touching the network (P3.2).
 *
 * Keying ProductDetails by the id remounts it when the route moves to another
 * product, which resets the chosen thumbnail and the quantity along with it.
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
  const [feedback, setFeedback] = useState('')

  const { addItem } = useCart()

  function handleAddToCart(item: Product) {
    const added = addItem(item, quantity)
    // P3.3 asks for simple inline feedback at CORE; the shared Toast system
    // is FULL. Saying how many units went in is more useful than "done",
    // because the cart caps the line at the remaining stock.
    setFeedback(
      added > 0
        ? `Added ${added} to your cart.`
        : 'Your cart already holds all the stock we have.',
    )
  }

  useEffect(() => {
    let ignore = false

    fetchProductById(productId)
      .then((result) => {
        if (ignore) return
        if (result === null) {
          setStatus('not-found')
          return
        }
        setProduct(result)
        setStatus('success')
      })
      .catch(() => {
        if (ignore) return
        setStatus('error')
      })

    return () => {
      ignore = true
    }
    // `productId` is in the dependency list, so moving from one product to
    // another refetches. Without it the URL would change and the data would
    // not (P3.2).
  }, [productId])

  if (status === 'not-found') {
    return <NotFoundPage />
  }

  if (status === 'loading') {
    return (
      <Container className="py-8">
        <StateMessage title="Loading product..." />
      </Container>
    )
  }

  if (status === 'error' || product === null) {
    return (
      <Container className="py-8">
        <StateMessage
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
            {product.category}
          </p>

          <div className="mt-6">
            <ProductPrice
              price={product.price}
              discountPercentage={product.discountPercentage}
              size="lg"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm tabular-nums text-neutral-600">
              &#9733; {product.rating.toFixed(1)}
            </span>
            <StockBadge stock={product.stock} />
          </div>

          <h2 className="mt-8 text-base font-medium text-neutral-950">Description</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-neutral-700">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              max={Math.max(product.stock, 1)}
              onChange={setQuantity}
              label={product.title}
            />
            <Button
              disabled={isSoldOut}
              onClick={() => handleAddToCart(product)}
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

          {feedback !== '' && !isSoldOut ? (
            <p role="status" className="mt-4 text-sm text-neutral-700">
              {feedback}{' '}
              <Link
                to="/cart"
                className="rounded-sm font-medium text-neutral-950 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
              >
                View cart
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </Container>
  )
}
