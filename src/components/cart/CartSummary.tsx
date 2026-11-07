import type { ReactNode } from 'react'
import type { Cart } from '../../models/Cart'
import { formatPrice } from '../../utils/format'

interface CartSummaryProps {
  cart: Cart
  promoCode: string | null
  onRemovePromo?: () => void
  children?: ReactNode
}

/**
 * Subtotal, Discount, Shipping and Total (Annex A, P4.1 and P5).
 *
 * One component for the cart and the checkout, reading one Cart, so the two
 * screens cannot quote different numbers for the same basket.
 */
export default function CartSummary({
  cart,
  promoCode,
  onRemovePromo,
  children,
}: CartSummaryProps) {
  const discount = cart.discount()
  const shipping = cart.shipping()
  const plan = cart.deliveryPlan()

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <h2 className="text-base font-medium text-ink">Summary</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums text-ink">{formatPrice(cart.subtotal())}</dd>
        </div>

        {/* Only shown once it is real: a permanent "Discount $0.00" row is
            noise, and P4.4 introduces the line with the code applied. */}
        {discount > 0 && promoCode !== null ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">
              Discount ({promoCode} &minus;10%)
              {onRemovePromo ? (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={onRemovePromo}
                    className="rounded-sm underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Remove
                  </button>
                </>
              ) : null}
            </dt>
            <dd className="tabular-nums text-green-800 dark:text-green-400">&minus;{formatPrice(discount)}</dd>
          </div>
        ) : null}

        {/*
          Delivery cannot be quoted before it is known where the order is
          going, so until a city is chosen this says so instead of showing
          "Free" - which would be a figure the shopper would then watch
          change, and the one thing a total must not do.
        */}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">
            Delivery
            {plan.destination !== null ? (
              <span className="text-subtle"> to {plan.destination.name}</span>
            ) : null}
          </dt>
          <dd className="tabular-nums text-ink">
            {plan.destination === null
              ? <span className="text-subtle">Choose a city</span>
              : shipping === 0
                ? 'Free'
                : formatPrice(shipping)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="font-medium text-ink">
            Total
            {/* Said out loud, because otherwise this figure is one a shopper
                would watch change later - and a total that moves after it has
                been read is worse than one that admits it is incomplete. */}
            {plan.destination === null ? (
              <span className="block text-xs font-normal text-subtle">
                Before delivery
              </span>
            ) : null}
          </dt>
          <dd className="text-lg font-bold tabular-nums text-ink">
            {formatPrice(cart.total())}
          </dd>
        </div>
      </dl>

      {children}
    </div>
  )
}
