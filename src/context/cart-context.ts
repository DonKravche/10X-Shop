import { createContext, useContext } from 'react'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'

/**
 * The shared cart (Annex A, P4).
 *
 * Every screen reads the cart from here, which is what keeps the header
 * badge, the cart page and the checkout summary showing the same numbers.
 *
 * The detailed reducer architecture in P4.2 is FULL; CORE holds the items in
 * useState and updates them immutably.
 */
export interface CartContextValue {
  items: CartItem[]
  /** Total number of units in the cart, i.e. the header badge. */
  itemCount: number
  /** Sum of discounted unit price x quantity, over all lines. */
  subtotal: number
  /**
   * Adds `quantity` units, merging into an existing line. The result is
   * capped at the product's stock, so the cart can never hold more than the
   * shop has. Returns the number of units actually added, which is 0 when the
   * line is already at stock.
   */
  addItem: (product: Product, quantity?: number) => number
  removeItem: (productId: number) => void
  /** Sets an absolute quantity, clamped to 1..stock. */
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (value === null) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return value
}
