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
  /**
   * The product's category, which is what decides the warehouse it ships
   * from. Copied onto the line for the same reason as the price: the cart
   * must be able to price its own delivery without going back to the API.
   */
  category: string
}

export interface CartState {
  items: CartItem[]
  /** The applied promo code, or null (Annex A, P4.4). */
  promoCode: string | null
  /**
   * The slug of the city the basket is going to, or null until one is
   * chosen. It lives with the cart rather than with the checkout form so
   * that the cart page can quote a real total before checkout is reached,
   * and so both screens quote the same one.
   */
  destination: string | null
}
