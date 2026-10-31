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
  total: number
  /** new Date().toISOString(), which is what the status is computed from. */
  placedAt: string
}
