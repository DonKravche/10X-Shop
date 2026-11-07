import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, CartState } from '../types/cart'
import type { Product } from '../types/product'
import { isCitySlug } from '../data/cities'
import { Cart } from '../models/Cart'
import { cartStorage } from '../models/storage'
import { CartContext } from './cart-context'
import { cartReducer } from './cart.reducer'
import type { CartAction } from './cart.reducer'

const EMPTY_CART: CartState = { items: [], promoCode: null, destination: null }

/**
 * Narrows one parsed value to a CartItem.
 *
 * JSON has no types, so anything read back from localStorage is `unknown`
 * until it has been checked. Without this a hand-edited or half-written
 * `shop_cart` would put malformed lines into the cart and break the totals.
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
    item.quantity > 0 &&
    typeof item.category === 'string'
  )
}

/**
 * Gives a saved line the category field it may predate.
 *
 * Lines written before delivery was priced by distance have no category, and
 * the guard above would drop them - emptying a cart somebody had filled, over
 * a field they never knew existed. An empty category is not a lie: it routes
 * to the default warehouse, which is exactly where something of unknown
 * provenance should ship from. Repaired on read, as orders are.
 */
function withCategory(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value

  const item = value as Record<string, unknown>
  return typeof item.category === 'string' ? item : { ...item, category: '' }
}

/**
 * The saved cart, or an empty one. Used as useReducer's lazy initialiser, so
 * localStorage is read once on mount rather than on every render.
 */
function readStoredCart(): CartState {
  const stored = cartStorage.get()
  if (stored === null) return EMPTY_CART

  const items = Array.isArray(stored.items)
    ? stored.items.map(withCategory).filter(isCartItem)
    : []
  const promoCode =
    typeof stored.promoCode === 'string' && Cart.isValidPromo(stored.promoCode)
      ? stored.promoCode
      : null
  // Only a city the shop still delivers to. One dropped from the list must
  // not leave a basket priced against a place that no longer exists.
  const destination = isCitySlug(stored.destination) ? stored.destination : null

  return { items, promoCode, destination }
}

interface CartProviderProps {
  children: ReactNode
}

export default function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, undefined, readStoredCart)

  /**
   * The latest state, readable synchronously.
   *
   * `dispatch` only schedules a render, so within one event handler `state`
   * is still the value from the last one. Two rapid clicks on Add to cart
   * would both measure against the same stale cart and the second would
   * report the wrong number - the bug in DEBUG-LOG entry 7.
   *
   * This stays correct by applying each action through the same pure reducer
   * as it is dispatched. Because `cartReducer` is a pure function, running it
   * here produces exactly the state React will arrive at, just sooner.
   */
  const stateRef = useRef(state)

  const send = useCallback((action: CartAction): CartState => {
    const next = cartReducer(stateRef.current, action)
    stateRef.current = next
    dispatch(action)
    return next
  }, [])

  // Persisting is a side effect, so it lives here and not in the reducer.
  useEffect(() => {
    stateRef.current = state
    cartStorage.set(state)
  }, [state])

  const addItem = useCallback(
    (product: Product, quantity = 1): number => {
      const before = stateRef.current.items.find(
        (item) => item.productId === product.id,
      )
      const alreadyInCart = before?.quantity ?? 0
      const added = Math.max(
        Math.min(quantity, product.stock - alreadyInCart),
        0,
      )

      if (added === 0) return 0

      send({ type: 'ADD_ITEM', product, qty: added })
      return added
    },
    [send],
  )

  const removeItem = useCallback(
    (productId: number) => {
      send({ type: 'REMOVE_ITEM', productId })
    },
    [send],
  )

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      send({ type: 'SET_QTY', productId, qty: quantity })
    },
    [send],
  )

  const clear = useCallback(() => {
    send({ type: 'CLEAR' })
  }, [send])

  const applyPromo = useCallback(
    (code: string): boolean => {
      // Whether a code is real is the Cart's rule, not the reducer's: the
      // reducer stores what it is told, so the check belongs in front of it.
      if (!Cart.isValidPromo(code)) return false
      send({ type: 'APPLY_PROMO', code })
      return true
    },
    [send],
  )

  const removePromo = useCallback(() => {
    send({ type: 'REMOVE_PROMO' })
  }, [send])

  const setDestination = useCallback(
    (city: string | null) => {
      send({ type: 'SET_DESTINATION', city })
    },
    [send],
  )

  // One Cart per state, so every screen that asks about money asks the same
  // object and cannot disagree with another (P4.3).
  const cart = useMemo(
    () => new Cart(state.items, state.promoCode, state.destination),
    [state.items, state.promoCode, state.destination],
  )

  const value = useMemo(
    () => ({
      items: state.items,
      promoCode: state.promoCode,
      destination: state.destination,
      itemCount: cart.itemCount,
      cart,
      addItem,
      removeItem,
      setQuantity,
      clear,
      applyPromo,
      removePromo,
      setDestination,
    }),
    [
      state,
      cart,
      addItem,
      removeItem,
      setQuantity,
      clear,
      applyPromo,
      removePromo,
      setDestination,
    ],
  )

  return <CartContext value={value}>{children}</CartContext>
}
