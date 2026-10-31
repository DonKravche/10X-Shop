import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import OrderStatusBadge from '../components/order/OrderStatusBadge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { useCart } from '../context/cart-context'
import { useToast } from '../context/toast-context'
import { useNow } from '../hooks/useNow'
import { OrderModel, readOrders } from '../models/Order'
import { orderStorage } from '../models/storage'
import type { OrderStatus } from '../types/order'
import type { Product } from '../types/product'
import { discountedPrice, formatDate, formatPrice } from '../utils/format'
import NotFoundPage from './NotFoundPage'

const RECHECK_MS = 30_000
const TIMELINE: OrderStatus[] = ['Processing', 'Shipped', 'Delivered']

/**
 * Annex A, P6.3. One order.
 *
 * Doubles as the order confirmation: Checkout navigates here with
 * `state.justPlaced`, so the "thank you" and the order the customer can come
 * back to are the same screen rather than two that have to agree.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const now = useNow(RECHECK_MS)

  const [orders] = useState(() => readOrders(orderStorage.get()))

  const orderId = Number(id)
  const order = useMemo(
    () => orders.find((entry) => entry.id === orderId) ?? null,
    [orders, orderId],
  )

  const justPlaced =
    typeof location.state === 'object' &&
    location.state !== null &&
    'justPlaced' in location.state &&
    location.state.justPlaced === true

  // An id that is not a number, or one with no order behind it, is not an
  // order that failed to load - it is not an order (P6.3).
  if (!Number.isInteger(orderId) || order === null) {
    return <NotFoundPage />
  }

  const status = OrderModel.statusOf(order, now)
  const reached = TIMELINE.indexOf(status)

  /**
   * Puts the same items back in the cart (P6.1 registry).
   *
   * The order stores the price and stock as they were when it was placed, so
   * each line is replayed through the cart's own `addItem`, which caps at
   * stock and merges with whatever is already there.
   */
  const handleReorder = () => {
    for (const item of order.items) {
      const asProduct: Product = {
        id: item.productId,
        title: item.title,
        description: '',
        category: '',
        price: item.price,
        discountPercentage: item.discountPercentage,
        rating: 0,
        stock: item.stock,
        thumbnail: item.thumbnail,
        images: [],
      }
      addItem(asProduct, item.quantity)
    }
    showToast('Items added to cart ✓') // taste-skill-ignore: P6 fixes this string
    navigate('/cart')
  }

  return (
    <Container className="py-8">
      <Link
        to="/orders"
        className="mb-4 inline-flex min-h-11 items-center rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        &larr; Back to orders
      </Link>

      {justPlaced ? (
        <p
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
        >
          Thank you! Your order has been placed.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Order #{order.number}
          </h1>
          <p className="mt-1 text-sm text-subtle">{formatDate(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <ol className="mt-8 flex flex-wrap gap-6 border-y border-line py-4">
        {TIMELINE.map((step, index) => (
          <li key={step} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={
                index <= reached ? 'text-green-700 dark:text-green-400' : 'text-strong'
              }
            >
              {index <= reached ? '✓' : '○'}{/* taste-skill-ignore: P6.3 draws the timeline with these marks */}
            </span>
            <span
              className={
                index <= reached ? 'font-medium text-ink' : 'text-subtle'
              }
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-base font-medium text-ink">Items</h2>
          <ul className="mt-4 rounded-lg border border-line bg-surface px-5">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-wrap items-center gap-4 border-b border-line py-4 last:border-b-0"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-md border border-line bg-surface object-contain p-1"
                />
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-sm tabular-nums text-subtle">
                    {formatPrice(discountedPrice(item.price, item.discountPercentage))}{' '}
                    &times; {item.quantity}
                  </p>
                </div>
                <p className="ml-auto text-sm font-bold tabular-nums text-ink">
                  {formatPrice(
                    discountedPrice(item.price, item.discountPercentage) * item.quantity,
                  )}
                </p>
              </li>
            ))}
          </ul>

          <Button onClick={handleReorder} className="mt-6">
            Reorder
          </Button>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Shipping to</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
              {order.shipping.fullName}
              <br />
              {order.shipping.address}
              <br />
              {order.shipping.city}
              <br />
              {order.shipping.email}
            </address>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Totals</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">
                  {formatPrice(order.subtotal)}
                </dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Discount</dt>
                  <dd className="tabular-nums text-green-800 dark:text-green-400">
                    &minus;{formatPrice(order.discount)}
                  </dd>
                </div>
              ) : null}
              {/* Always shown, free or not: leaving it out when it was zero
                  would be fine, but leaving it out when it was charged made
                  the three figures on screen fail to add up. */}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums text-ink">
                  {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="text-lg font-bold tabular-nums text-ink">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </Container>
  )
}
