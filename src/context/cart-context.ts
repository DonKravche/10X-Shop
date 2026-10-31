import { createContext, useContext } from 'react'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'
import type { Cart } from '../models/Cart'

/**
 * The shared cart (Annex A, P4).
 *
 * Every screen reads the cart from here, which is what keeps the header
 * badge, the cart page and the checkout summary showing the same numbers.
 */
export interface CartContextValue {
  items: CartItem[]
  /** The applied promo code, or null (P4.4). */
  promoCode: string | null
  /** Total units in the cart, i.e. the header badge. */
  itemCount: number
  /** The money, computed by the Cart class so every screen agrees (P4.3). */
  cart: Cart

  /**
   * Adds `quantity` units, merging into an existing line and capping at the
   * product's stock. Returns how many were actually added, which is 0 when
   * the line is already at stock - so the caller can say which happened.
   */
  addItem: (product: Product, quantity?: number) => number
  removeItem: (productId: number) => void
  /** Sets an absolute quantity, clamped to 1..stock. */
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
  /** Applies a code. Returns false when it is not a code we know (P4.4). */
  applyPromo: (code: string) => boolean
  removePromo: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (value === null) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return value
}
