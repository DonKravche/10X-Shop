import { Link, useLocation } from 'react-router-dom'
import CartItemRow from '../components/cart/CartItemRow'
import CartSummary from '../components/cart/CartSummary'
import PromoForm from '../components/cart/PromoForm'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import StateMessage from '../components/ui/StateMessage'
import { useCart } from '../context/cart-context'
import { useToast } from '../context/toast-context'

/**
 * Annex A, P4. The cart: change quantities, remove lines, apply a code and
 * see what it all comes to.
 *
 * None of the arithmetic happens here. The Cart class answers every money
 * question (P4.3), which is what keeps this page and the checkout summary
 * from ever disagreeing.
 */
export default function CartPage() {
  const {
    items,
    itemCount,
    cart,
    promoCode,
    setQuantity,
    removeItem,
    clear,
    applyPromo,
    removePromo,
  } = useCart()
  const { showToast } = useToast()
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

  function handleRemove(productId: number) {
    removeItem(productId)
    showToast('Removed from cart')
  }

  function handleApplyPromo(code: string): boolean {
    const applied = applyPromo(code)
    if (applied) showToast('Promo code applied')
    return applied
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-1 flex-col py-8">
        <PageHeader title="Your cart" />
        <StateMessage
          fill
          title="Your cart is empty."
          description={
            cameFromEmptyCheckout
              ? 'There is nothing to check out yet. Add a product first.'
              : undefined
          }
        >
          <Link
            to="/catalog"
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-surface transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
          <ul className="rounded-lg border border-line bg-surface px-5">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onQuantityChange={setQuantity}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <button
            type="button"
            onClick={handleClear}
            className="mt-4 min-h-11 rounded-md px-2 text-sm text-muted underline underline-offset-2 transition-colors hover:text-red-700 dark:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Clear cart
          </button>
        </div>

        <aside className="lg:col-span-1">
          <CartSummary cart={cart} promoCode={promoCode} onRemovePromo={removePromo}>
            {promoCode === null ? <PromoForm onApply={handleApplyPromo} /> : null}

            <Link
              to="/checkout"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-surface transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Proceed to checkout
            </Link>
          </CartSummary>
        </aside>
      </div>
    </Container>
  )
}
