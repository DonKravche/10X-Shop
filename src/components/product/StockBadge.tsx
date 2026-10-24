interface StockBadgeProps {
  stock: number
}

/**
 * The three stock states (Annex A, P2.3 and P3.3), defined once so the
 * catalogue card and the product page can never disagree about availability.
 *
 *   stock = 0      -> "Out of stock"
 *   1 <= stock <= 5 -> "Only N left!"
 *   stock > 5      -> "In stock"
 *
 * Status is the only place colour is allowed on this interface, so these
 * three pills carry it and the rest of the chrome stays achromatic.
 */
export default function StockBadge({ stock }: StockBadgeProps) {
  const base =
    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'

  if (stock === 0) {
    return <span className={`${base} bg-red-50 text-red-800`}>Out of stock</span>
  }

  if (stock <= 5) {
    return (
      <span className={`${base} bg-amber-50 text-amber-800`}>Only {stock} left!</span>
    )
  }

  return <span className={`${base} bg-green-100 text-green-900`}>In stock</span>
}
