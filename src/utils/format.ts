/**
 * Pure, typed formatting helpers (Annex A, T3).
 *
 * The discounted price is computed in exactly one place so the catalogue card,
 * the product page and the cart can never disagree about what a product costs.
 */

/** `1299` -> `"$1,299.00"`. */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * `price x (1 - discountPercentage / 100)`, rounded to two decimals
 * (Annex A, P2.3). Rounding happens here so every total is built from the
 * same displayed figures.
 */
export function discountedPrice(price: number, discountPercentage: number): number {
  const discounted = price * (1 - discountPercentage / 100)
  return Math.round(discounted * 100) / 100
}

/** True when a product carries a discount worth showing (Annex A, P2.3). */
export function hasDiscount(discountPercentage: number): boolean {
  return discountPercentage >= 1
}
