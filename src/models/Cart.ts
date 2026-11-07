import type { CartItem } from '../types/cart'
import type { DeliveryPlan } from '../types/storage'
import { discountedPrice } from '../utils/format'
import { Delivery } from './Delivery'

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
  /** The one promo code of P4.4. */
  static readonly PROMO_CODE = '10X10'
  static readonly PROMO_RATE = 0.1

  constructor(
    private readonly items: CartItem[],
    private readonly promoCode: string | null,
    /** The city the basket is going to, or null until one is chosen. */
    private readonly destination: string | null = null,
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

  /**
   * What it costs to bring this basket from storage to the customer.
   *
   * Delegated to `Delivery`, which finds the nearest warehouse stocking each
   * line and charges each journey by its distance. Until a destination has
   * been chosen there is no journey to price, so this is zero and the screens
   * say the charge is not known yet rather than claiming it is free.
   */
  shipping(): number {
    if (this.isEmpty) return 0
    return this.delivery.total()
  }

  /** The journeys behind that figure, for the screens that show them. */
  deliveryPlan(): DeliveryPlan {
    return this.delivery.plan()
  }

  /** True once a city has been chosen, so a charge can be quoted at all. */
  get hasDestination(): boolean {
    return this.deliveryPlan().destination !== null
  }

  private deliveryCache: Delivery | null = null

  /**
   * One Delivery per Cart, built on first use.
   *
   * It caches the plan it works out, so handing every caller the same
   * instance means the journeys are computed once however many times the
   * summary, the total and the panel each ask for them.
   *
   * A getter rather than a field initialised to `new Delivery(this.items, …)`,
   * because a field initialiser and the constructor's parameter properties
   * are assigned in an order that depends on the compile target - and if the
   * field won, it would read `this.items` before it had been set.
   */
  private get delivery(): Delivery {
    this.deliveryCache ??= new Delivery(this.items, this.destination)
    return this.deliveryCache
  }

  total(): number {
    return this.round(this.subtotal() - this.discount() + this.shipping())
  }

  /** Money is kept at two decimals so the figures add up as displayed. */
  private round(value: number): number {
    return Math.round(value * 100) / 100
  }
}
