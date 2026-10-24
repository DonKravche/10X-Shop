import { discountedPrice, formatPrice, hasDiscount } from '../../utils/format'

interface ProductPriceProps {
  price: number
  discountPercentage: number
  /** `lg` is used on the product page, `sm` on cards and cart rows. */
  size?: 'sm' | 'lg'
}

/**
 * The price block (Annex A, P2.3): the payable price, the struck-through
 * original and the discount badge.
 *
 * Rendering it through one component means the catalogue, the product page
 * and the cart always quote the same figure for the same product.
 *
 * Figures use tabular numerals so prices line up digit for digit in a column.
 */
export default function ProductPrice({
  price,
  discountPercentage,
  size = 'sm',
}: ProductPriceProps) {
  const payable = discountedPrice(price, discountPercentage)
  const discounted = hasDiscount(discountPercentage)

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className={`font-bold tabular-nums text-neutral-950 ${
          size === 'lg' ? 'text-3xl' : 'text-base'
        }`}
      >
        {formatPrice(payable)}
      </span>

      {discounted ? (
        <>
          <span
            className={`tabular-nums text-neutral-500 line-through ${
              size === 'lg' ? 'text-base' : 'text-sm'
            }`}
          >
            {formatPrice(price)}
          </span>
          <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium tabular-nums text-green-900">
            &minus;{Math.round(discountPercentage)}%
          </span>
        </>
      ) : null}
    </div>
  )
}
