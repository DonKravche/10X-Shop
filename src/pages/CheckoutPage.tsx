import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import type { CheckoutFormErrors, CheckoutFormValues, OrderSummary } from '../types/checkout'
import { discountedPrice, formatPrice } from '../utils/format'
import { hasErrors, validateCheckout } from '../utils/validation'

/**
 * Annex A, P5. Four controlled fields and a locally simulated order.
 *
 * Nothing here talks to a server. There is no payment, no card data and no
 * POST /carts/add: the order is built in React state and shown back to the
 * customer (PRD rule 7, P5.3). The phone, postal code, country and card
 * fields in the P5.2 table belong to a withdrawn schema and are not
 * implemented - PRD rule 3 gives the CORE definition precedence.
 */
export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, itemCount, subtotal, clear } = useCart()

  const [values, setValues] = useState<CheckoutFormValues>({
    // P5.1 allows prefilling from the signed-in user.
    fullName: user.username,
    email: '',
    address: '',
    city: '',
  })
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [isPlacing, setIsPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<OrderSummary | null>(null)

  // An empty cart has nothing to check out, so the customer goes back to the
  // cart, which explains itself (P5.1). Skipped once an order exists,
  // otherwise placing one would immediately bounce off its own confirmation.
  if (items.length === 0 && placedOrder === null) {
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

    // Built from the cart as it stands, before the cart is emptied.
    setPlacedOrder({ itemCount, total: subtotal, shipping: values })
    clear()
  }

  if (placedOrder !== null) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl rounded-lg border border-neutral-200 bg-white p-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            Thank you! Your order has been placed.
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            A confirmation is on its way to {placedOrder.shipping.email}.
          </p>

          <dl className="mt-8 space-y-3 border-t border-neutral-200 pt-6 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-neutral-600">Items</dt>
              <dd className="tabular-nums text-neutral-950">{placedOrder.itemCount}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-neutral-600">Shipping to</dt>
              <dd className="text-right text-neutral-950">
                {placedOrder.shipping.fullName}
                <br />
                {placedOrder.shipping.address}, {placedOrder.shipping.city}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 pt-3">
              <dt className="font-medium text-neutral-950">Total paid</dt>
              <dd className="text-lg font-bold tabular-nums text-neutral-950">
                {formatPrice(placedOrder.total)}
              </dd>
            </div>
          </dl>

          <Link
            to="/"
            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            Continue shopping
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <PageHeader title="Checkout" description="Where should we send your order?" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="text-base font-medium text-neutral-950">Shipping details</h2>

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
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-base font-medium text-neutral-950">Order summary</h2>

            <ul className="mt-4 space-y-3 border-b border-neutral-200 pb-4 text-sm">
              {items.map((item) => (
                <li key={item.productId} className="flex items-baseline justify-between gap-3">
                  <span className="text-neutral-600">
                    {item.title}
                    <span className="tabular-nums"> &times; {item.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-950">
                    {formatPrice(
                      discountedPrice(item.price, item.discountPercentage) * item.quantity,
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-medium text-neutral-950">Total</span>
              <span className="text-lg font-bold tabular-nums text-neutral-950">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  )
}
