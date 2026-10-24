/**
 * Product domain models (Annex A1.5).
 *
 * These describe only the fields the CORE application actually reads from
 * DummyJSON. `reviews` is deliberately absent: reviews are a FULL feature and
 * PRD rule 4 requires the types to match what is really implemented.
 */

export interface Product {
  id: number
  title: string
  description: string
  category: string
  brand?: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  thumbnail: string
  images: string[]
}

/** Shape of `GET /products` and `GET /products/search`. */
export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}
