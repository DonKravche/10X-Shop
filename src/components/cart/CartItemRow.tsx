import { Link } from 'react-router-dom'
import type { CartItem } from '../../types/cart'
import { discountedPrice, formatPrice } from '../../utils/format'
import QuantityStepper from '../ui/QuantityStepper'

interface CartItemRowProps {
  item: CartItem
  /** Callback props: the row reports intent, the page performs it. */
  onQuantityChange: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
}

/**
 * One line of the cart (Annex A, P4.1).
 *
 * The line total is the discounted unit price times the quantity, computed
 * from the same helper the card and the product page use, so the arithmetic
 * on screen always adds up.
 */
export default function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const unitPrice = discountedPrice(item.price, item.discountPercentage)
  const lineTotal = unitPrice * item.quantity

  return (
    <li className="flex flex-wrap items-start gap-4 border-b border-neutral-200 py-5 last:border-b-0">
      <img
        src={item.thumbnail}
        alt={item.title}
        width={80}
        height={80}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-md border border-neutral-200 bg-white object-contain p-1"
      />

      <div className="min-w-48 flex-1">
        <h3 className="text-sm font-medium text-neutral-950">
          <Link
            to={`/products/${item.productId}`}
            className="rounded-sm underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm tabular-nums text-neutral-500">
          {formatPrice(unitPrice)} each
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={item.quantity}
            max={item.stock}
            onChange={(next) => onQuantityChange(item.productId, next)}
            label={item.title}
          />
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="min-h-11 rounded-md px-2 text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="ml-auto text-sm font-bold tabular-nums text-neutral-950">
        {formatPrice(lineTotal)}
      </p>
    </li>
  )
}
