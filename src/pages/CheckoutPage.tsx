import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import CartSummary from '../components/cart/CartSummary'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import { OrderModel, readOrders } from '../models/Order'
import { orderStorage } from '../models/storage'
import type { CheckoutFormErrors, CheckoutFormValues } from '../types/checkout'
import { formatPrice } from '../utils/format'
import { discountedPrice } from '../utils/format'
import { hasErrors, validateCheckout } from '../utils/validation'

/**
 * Annex A, P5. Four controlled fields and a locally simulated order.
 *
 * Nothing here talks to a server. There is no payment, no card data and no
 * POST /carts/add: the order is built from the cart and written to
 * localStorage (PRD rule 7, P5.3). The phone, postal code, country and card
 * fields in the P5.2 table belong to a withdrawn schema and are not
 * implemented - PRD rule 3 gives the CORE definition precedence.
 */
export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, cart, promoCode, clear } = useCart()
  const navigate = useNavigate()

  const [values, setValues] = useState<CheckoutFormValues>({
    // P5.1 allows prefilling from the signed-in user.
    fullName: user.username,
    email: '',
    address: '',
    city: '',
  })
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [isPlacing, setIsPlacing] = useState(false)
  const [hasPlaced, setHasPlaced] = useState(false)

  // An empty cart has nothing to check out, so the customer goes back to the
  // cart, which explains itself (P5.1).
  //
  // `hasPlaced` is what stops this from firing on the way out: placing an
  // order empties the cart, so without it this component would re-render into
  // its own redirect and send the customer to /cart instead of to the order
  // they just placed.
  if (items.length === 0 && !hasPlaced) {
    return <Navigate to="/cart" replace state={{ from: 'checkout-empty' }} />
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Guards against a second submit while the first is being handled
    // (P5.3.1); the button is disabled for the same reason.
    if (isPlacing) return
    setIsPlacing(true)

    const nextErrors = validateCheckout(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      setIsPlacing(false)
      return
    }

    // Built from the cart as it stands, before the cart is emptied. The
    // existing orders are passed in so the number continues the sequence.
    const previous = readOrders(orderStorage.get())
    const order = OrderModel.create(cart, items, values, previous)

    orderStorage.set([order.toJSON(), ...previous])
    // Set before clearing, so the empty-cart redirect above cannot win the
    // race with the navigation below.
    setHasPlaced(true)
    clear()

    // The confirmation is the order's own page, so "Thank you" and the order
    // the customer can come back to are the same screen rather than two.
    navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } })
  }

  return (
    <Container className="py-8">
      <PageHeader title="Checkout" description="Where should we send your order?" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-base font-medium text-ink">Shipping details</h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                id="fullName"
                name="fullName"
                label="Full name"
                type="text"
                autoComplete="name"
                className="sm:col-span-2"
                value={values.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                className="sm:col-span-2"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />
              <FormField
                id="address"
                name="address"
                label="Address"
                type="text"
                autoComplete="street-address"
                className="sm:col-span-2"
                value={values.address}
                onChange={handleChange}
                error={errors.address}
              />
              <FormField
                id="city"
                name="city"
                label="City"
                type="text"
                autoComplete="address-level2"
                value={values.city}
                onChange={handleChange}
                error={errors.city}
              />
            </div>
          </div>

          <Button type="submit" disabled={isPlacing} className="mt-6 min-w-44">
            Place order
          </Button>
        </form>

        <aside className="lg:col-span-1">
          <CartSummary cart={cart} promoCode={promoCode}>
            <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              {items.map((item) => (
                <li key={item.productId} className="flex items-baseline justify-between gap-3">
                  <span className="text-muted">
                    {item.title}
                    <span className="tabular-nums"> &times; {item.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink">
                    {formatPrice(
                      discountedPrice(item.price, item.discountPercentage) * item.quantity,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CartSummary>
        </aside>
      </div>
    </Container>
  )
}
