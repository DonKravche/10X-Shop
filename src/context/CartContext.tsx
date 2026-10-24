import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, CartState } from '../types/cart'
import type { Product } from '../types/product'
import { discountedPrice } from '../utils/format'
import { CartContext } from './cart-context'

/** Annex A1.5 names this key for the cart. */
const STORAGE_KEY = 'shop_cart'

/**
 * Narrows one parsed value to a CartItem.
 *
 * JSON has no types, so anything read back from localStorage is `unknown`
 * until it has been checked. Without this a hand-edited or half-written
 * `shop_cart` would put malformed lines into the cart and crash the totals.
 */
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'number' &&
    typeof item.title === 'string' &&
    typeof item.thumbnail === 'string' &&
    typeof item.price === 'number' &&
    typeof item.discountPercentage === 'number' &&
    typeof item.stock === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
}

/** Reads the saved cart, falling back to an empty one on anything unexpected. */
function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return []

    const items = (parsed as Partial<CartState>).items
    if (!Array.isArray(items)) return []

    return items.filter(isCartItem)
  } catch {
    // Corrupt JSON, or storage blocked in a private window: start empty
    // rather than taking the whole application down.
    return []
  }
}

interface CartProviderProps {
  children: ReactNode
}

export default function CartProvider({ children }: CartProviderProps) {
  // Lazy initialiser: localStorage is read once on mount, not on every render.
  const [items, setItems] = useState<CartItem[]>(readStoredCart)

  // Persist on every change, so a reload keeps the cart (A1.5).
  useEffect(() => {
    try {
      const state: CartState = { items }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be full or blocked. The cart still works in memory, so
      // failing to save must not break the page.
    }
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1): number => {
    let added = 0

    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      const alreadyInCart = existing?.quantity ?? 0
      // Never let the cart exceed what the shop has (P4.2, P3.3).
      const room = product.stock - alreadyInCart
      added = Math.max(Math.min(quantity, room), 0)

      if (added === 0) return current

      if (existing) {
        // map() returns a new array and a new object for the changed line;
        // the other lines keep their identity.
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + added }
            : item,
        )
      }

      const line: CartItem = {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity: added,
      }
      return [...current, line]
    })

    return added
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) }
          : item,
      ),
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  // Built from the same discounted unit price the cards and the cart show, so
  // the total always matches the figures on screen.
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + discountedPrice(item.price, item.discountPercentage) * item.quantity,
        0,
      ),
    [items],
  )

  const value = useMemo(
    () => ({ items, itemCount, subtotal, addItem, removeItem, setQuantity, clear }),
    [items, itemCount, subtotal, addItem, removeItem, setQuantity, clear],
  )

  return <CartContext value={value}>{children}</CartContext>
}
