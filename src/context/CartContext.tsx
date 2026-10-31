import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

  /**
   * The latest cart, readable synchronously.
   *
   * `setItems` only schedules a render, so inside one event handler the
   * `items` variable still holds the array from the last render. `addItem`
   * has to answer "how many units actually went in" before that render
   * happens, and two clicks in the same tick would otherwise both measure
   * against the same stale array.
   */
  const itemsRef = useRef(items)

  /** The one place the cart changes: the ref and the state move together. */
  const commit = useCallback((next: CartItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

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

  const addItem = useCallback(
    (product: Product, quantity = 1): number => {
      const current = itemsRef.current
      const existing = current.find((item) => item.productId === product.id)
      const alreadyInCart = existing?.quantity ?? 0
      // Never let the cart exceed what the shop has (P4.2, P3.3).
      const room = product.stock - alreadyInCart
      const added = Math.max(Math.min(quantity, room), 0)

      if (added === 0) return 0

      if (existing) {
        // map() returns a new array and a new object for the changed line;
        // the other lines keep their identity.
        commit(
          current.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + added }
              : item,
          ),
        )
        return added
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
      commit([...current, line])
      return added
    },
    [commit],
  )

  const removeItem = useCallback(
    (productId: number) => {
      commit(itemsRef.current.filter((item) => item.productId !== productId))
    },
    [commit],
  )

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      commit(
        itemsRef.current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) }
            : item,
        ),
      )
    },
    [commit],
  )

  const clear = useCallback(() => {
    commit([])
  }, [commit])

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
