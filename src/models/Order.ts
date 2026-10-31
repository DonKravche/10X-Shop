import type { CartItem } from '../types/cart'
import type { Order, OrderStatus, ShippingInfo } from '../types/order'
import type { Cart } from './Cart'

/** P6.2 fixes the two thresholds the status is read from. */
const SHIPPED_AFTER_MS = 60_000
const DELIVERED_AFTER_MS = 180_000

/**
 * One placed order (Annex A, T4 and P6.2).
 *
 * The class wraps a plain `Order` rather than being stored as one, because a
 * class does not survive a JSON round trip: `JSON.parse` returns an object
 * with no prototype and no methods. So `toJSON()` is what goes into
 * localStorage and the constructor is what brings it back - which is exactly
 * why `toJSON` exists in the specification's sketch.
 */
export class OrderModel {
  constructor(private readonly order: Order) {}

  /**
   * Builds an order from a cart and the shipping details (static factory).
   *
   * It takes the orders already placed so the number can continue the
   * sequence; counting is the caller's data, not global state this class
   * should reach for.
   */
  static create(
    cart: Cart,
    items: CartItem[],
    shipping: ShippingInfo,
    previous: Order[],
  ): OrderModel {
    const placedAt = new Date()
    const sequence = previous.length + 1

    return new OrderModel({
      id: placedAt.getTime(),
      // "10X-00001": five digits, so the list stays aligned past 9 orders.
      number: `10X-${String(sequence).padStart(5, '0')}`,
      items,
      shipping,
      subtotal: cart.subtotal(),
      discount: cart.discount(),
      total: cart.total(),
      placedAt: placedAt.toISOString(),
    })
  }

  /**
   * Where the order is, derived from how long ago it was placed (P6.2).
   *
   * Nothing is stored: a saved status would have to be updated by something,
   * and there is no server to do it. A pure function of the order and the
   * current time has one input and one answer, needs no scheduler to stay
   * truthful, and can be checked by passing it a date.
   */
  static statusOf(order: Order, now: Date = new Date()): OrderStatus {
    const elapsed = now.getTime() - new Date(order.placedAt).getTime()
    if (elapsed < SHIPPED_AFTER_MS) return 'Processing'
    if (elapsed < DELIVERED_AFTER_MS) return 'Shipped'
    return 'Delivered'
  }

  status(now: Date = new Date()): OrderStatus {
    return OrderModel.statusOf(this.order, now)
  }

  get id(): number {
    return this.order.id
  }

  get number(): string {
    return this.order.number
  }

  /** Total units, for the "3 items" line in the list. */
  get itemCount(): number {
    return this.order.items.reduce((count, item) => count + item.quantity, 0)
  }

  /** The plain object that gets written to localStorage. */
  toJSON(): Order {
    return this.order
  }
}

/**
 * Narrows a parsed value to an Order (Annex A, T3).
 *
 * `shop_orders` is JSON, so it is `unknown` until checked. A half-written or
 * hand-edited entry would otherwise reach the status calculation as NaN and
 * show every order as Delivered.
 */
export function isOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false
  const order = value as Record<string, unknown>
  return (
    typeof order.id === 'number' &&
    typeof order.number === 'string' &&
    Array.isArray(order.items) &&
    typeof order.placedAt === 'string' &&
    !Number.isNaN(new Date(order.placedAt).getTime()) &&
    typeof order.total === 'number'
  )
}

/** Every saved order, newest first, with anything malformed dropped. */
export function readOrders(stored: Order[] | null): Order[] {
  if (!Array.isArray(stored)) return []
  return stored.filter(isOrder).sort((a, b) => b.id - a.id)
}
