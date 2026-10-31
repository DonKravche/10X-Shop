import type { CartItem } from '../types/cart'
import { discountedPrice } from '../utils/format'

/**
 * What a cart can be asked about its money (Annex A, T4).
 *
 * Declared as an interface so the class states what it implements, and so a
 * caller can depend on the four questions rather than on the class.
 */
export interface ICart {
  subtotal(): number
  discount(): number
  shipping(): number
  total(): number
}

/**
 * Every price calculation in the application (Annex A, P4.3 and T4).
 *
 * The cart's arithmetic lives here rather than in a component because it is
 * the one piece of real business logic in the project: the cart page, the
 * checkout summary and the placed order must all agree, and they can only do
 * that by asking the same object. No React, no DOM, nothing to render - which
 * also makes it the one part that could be unit tested without a browser.
 */
export class Cart implements ICart {
  /** Orders at or above this (after discount) ship free. */
  static readonly FREE_SHIPPING_FROM = 100
  static readonly SHIPPING_COST = 10
  /** The one promo code of P4.4. */
  static readonly PROMO_CODE = '10X10'
  static readonly PROMO_RATE = 0.1

  constructor(
    private readonly items: CartItem[],
    private readonly promoCode: string | null,
  ) {}

  /** Case-insensitive, as P4.4 requires. */
  static isValidPromo(code: string): boolean {
    return code.trim().toUpperCase() === Cart.PROMO_CODE
  }

  /** Total units, which is what the header badge shows. */
  get itemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * The sum of the discounted unit prices, rounded the same way they are
   * displayed, so the total always equals the lines the shopper can read.
   */
  subtotal(): number {
    return this.round(
      this.items.reduce(
        (sum, item) =>
          sum + discountedPrice(item.price, item.discountPercentage) * item.quantity,
        0,
      ),
    )
  }

  /** The promo code's share of the subtotal, or zero when none applies. */
  discount(): number {
    if (this.promoCode === null || !Cart.isValidPromo(this.promoCode)) return 0
    return this.round(this.subtotal() * Cart.PROMO_RATE)
  }

  /** Free over the threshold, and never charged on an empty cart. */
  shipping(): number {
    if (this.isEmpty) return 0
    const afterDiscount = this.subtotal() - this.discount()
    return afterDiscount >= Cart.FREE_SHIPPING_FROM ? 0 : Cart.SHIPPING_COST
  }

  total(): number {
    return this.round(this.subtotal() - this.discount() + this.shipping())
  }

  /** Money is kept at two decimals so the figures add up as displayed. */
  private round(value: number): number {
    return Math.round(value * 100) / 100
  }
}
