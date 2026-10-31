import type { CartItem, CartState } from '../types/cart'
import type { Product } from '../types/product'

/**
 * Everything that can happen to the cart (Annex A, P4.2).
 *
 * A discriminated union: `type` decides which other fields exist, so
 * `SET_QTY` cannot be dispatched without a quantity and `CLEAR` cannot carry
 * one. The alternative - one action shape with every field optional - moves
 * all of that checking to runtime.
 */
export type CartAction =
  | { type: 'ADD_ITEM'; product: Product; qty: number }
  | { type: 'SET_QTY'; productId: number; qty: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'CLEAR' }
  | { type: 'APPLY_PROMO'; code: string }
  | { type: 'REMOVE_PROMO' }

/** Keeps a quantity inside 1..stock (Annex A, P4.2). */
function clampQuantity(quantity: number, stock: number): number {
  return Math.min(Math.max(Math.round(quantity), 1), Math.max(stock, 1))
}

/**
 * The cart's only transition function (Annex A, P4.2).
 *
 * Pure: it reads nothing outside its arguments and writes nothing outside its
 * return value. In particular it never touches localStorage - saving is a
 * side effect and belongs in the provider's effect, not in the thing that
 * decides what the next state is. That is what makes it replayable: the same
 * state and action always give the same result, which the provider relies on
 * to answer "how many units went in" before React has re-rendered.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.productId === action.product.id)
      const alreadyInCart = existing?.quantity ?? 0
      // Never let the cart hold more than the shop has (P4.2, P3.3).
      const room = action.product.stock - alreadyInCart
      const added = Math.max(Math.min(action.qty, room), 0)

      if (added === 0) return state

      if (existing !== undefined) {
        return {
          ...state,
          // map() returns a new array and a new object for the changed line;
          // every other line keeps its identity.
          items: state.items.map((item) =>
            item.productId === action.product.id
              ? { ...item, quantity: item.quantity + added }
              : item,
          ),
        }
      }

      const line: CartItem = {
        productId: action.product.id,
        title: action.product.title,
        thumbnail: action.product.thumbnail,
        price: action.product.price,
        discountPercentage: action.product.discountPercentage,
        stock: action.product.stock,
        quantity: added,
      }
      return { ...state, items: [...state.items, line] }
    }

    case 'SET_QTY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: clampQuantity(action.qty, item.stock) }
            : item,
        ),
      }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.productId),
      }
    }

    case 'CLEAR': {
      return { items: [], promoCode: null }
    }

    case 'APPLY_PROMO': {
      return { ...state, promoCode: action.code.trim().toUpperCase() }
    }

    case 'REMOVE_PROMO': {
      return { ...state, promoCode: null }
    }

    default: {
      /*
       * Every case above is handled, so by here `action` has narrowed to
       * `never` and this assignment compiles. Add a seventh action without a
       * case for it and this line stops compiling - which is the point: the
       * compiler, not a test, is what notices the missing branch.
       */
      const exhaustive: never = action
      return exhaustive
    }
  }
}
