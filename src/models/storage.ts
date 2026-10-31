import { StorageService } from './StorageService'
import type { CartState } from '../types/cart'
import type { Order } from '../types/order'
import type { Review } from '../types/product'
import type { UserStore } from '../types/user'
import type { ThemeName } from '../types/theme'

/**
 * Every localStorage key the application uses (Annex A1.5, T3).
 *
 * `as const` makes each value a literal type rather than `string`, so a
 * mistyped key is a compile error instead of a quietly empty read.
 */
export const STORAGE_KEYS = {
  cart: 'shop_cart',
  user: 'shop_user',
  orders: 'shop_orders',
  reviews: 'shop_reviews',
  theme: 'shop_theme',
} as const

/** Reviews written in this browser, newest first, keyed by product id. */
export type StoredReviews = Record<number, Review[]>

export const cartStorage = new StorageService<CartState>(STORAGE_KEYS.cart)
export const userStorage = new StorageService<UserStore>(STORAGE_KEYS.user)
export const orderStorage = new StorageService<Order[]>(STORAGE_KEYS.orders)
export const reviewStorage = new StorageService<StoredReviews>(STORAGE_KEYS.reviews)
export const themeStorage = new StorageService<ThemeName>(STORAGE_KEYS.theme)
