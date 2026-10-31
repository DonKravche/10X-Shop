/**
 * Cart models (Annex A1.5).
 *
 * A cart line copies the few product fields the cart needs rather than
 * holding the whole `Product`, so the cart stays valid even if the catalogue
 * response changes shape.
 */

export interface CartItem {
  productId: number
  title: string
  thumbnail: string
  price: number
  discountPercentage: number
  stock: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  /** The applied promo code, or null (Annex A, P4.4). */
  promoCode: string | null
}
