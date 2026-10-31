import type { CartItem } from './cart'

/**
 * Order models (Annex A1.5, FULL).
 *
 * An order is created locally and never sent anywhere (PRD rule 7). There is
 * no payment method and no card data on it, because none is ever collected.
 */

/** The three states of P6.2, computed from the time an order was placed. */
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered'

/** The four CORE checkout fields, carried onto the order. */
export interface ShippingInfo {
  fullName: string
  email: string
  address: string
  city: string
}

export interface Order {
  /** Date.now() at placement, and the id in the URL. */
  id: number
  /** "10X-00001" - sequential, five digits (A1.5). */
  number: string
  items: CartItem[]
  shipping: ShippingInfo
  subtotal: number
  discount: number
  /**
   * What shipping cost at the time it was placed.
   *
   * Stored rather than recomputed because the thresholds can change: an order
   * has to keep showing what was actually charged. It is also what makes the
   * order's own figures add up - without it the detail page showed a subtotal
   * and a discount that did not reach the total.
   *
   * Named as A1.5 names it, to keep it apart from `shipping`, which is the
   * address the order goes to.
   */
  shippingCost: number
  total: number
  /** new Date().toISOString(), which is what the status is computed from. */
  placedAt: string
}
