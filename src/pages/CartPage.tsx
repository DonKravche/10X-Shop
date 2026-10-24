import { Link, useLocation } from 'react-router-dom'
import CartItemRow from '../components/cart/CartItemRow'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import StateMessage from '../components/ui/StateMessage'
import { useCart } from '../context/cart-context'
import { formatPrice } from '../utils/format'

/**
 * Annex A, P4. The cart: change quantities, remove lines, see the total.
 *
 * Discount and Shipping rows are absent from the summary because promo codes
 * and shipping thresholds are both FULL (P4.3, P4.4). CORE shows what the
 * customer actually owes: the subtotal and the total.
 */
export default function CartPage() {
  const { items, itemCount, subtotal, setQuantity, removeItem, clear } = useCart()
  const location = useLocation()

  /** Set when CheckoutPage bounced an empty cart back here (P5.1). */
  const cameFromEmptyCheckout =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    location.state.from === 'checkout-empty'

  function handleClear() {
    // P4.1 element 3 fixes this confirmation text.
    if (window.confirm('Clear the cart? This cannot be undone.')) {
      clear()
    }
  }

  if (items.length === 0) {
    return (
      <Container className="py-8">
        <PageHeader title="Your cart" />
        <StateMessage
          title="Your cart is empty."
          description={
            cameFromEmptyCheckout
              ? 'There is nothing to check out yet. Add a product first.'
              : undefined
          }
        >
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            Browse products
          </Link>
        </StateMessage>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Your cart"
        description={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="rounded-lg border border-neutral-200 bg-white px-5">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onQuantityChange={setQuantity}
                onRemove={removeItem}
              />
            ))}
          </ul>

          <button
            type="button"
            onClick={handleClear}
            className="mt-4 min-h-11 rounded-md px-2 text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            Clear cart
          </button>
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-base font-medium text-neutral-950">Summary</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="tabular-nums text-neutral-950">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 pt-3">
                <dt className="font-medium text-neutral-950">Total</dt>
                <dd className="text-lg font-bold tabular-nums text-neutral-950">
                  {formatPrice(subtotal)}
                </dd>
              </div>
            </dl>

            <Link
              to="/checkout"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
            >
              Proceed to checkout
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  )
}
