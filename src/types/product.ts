/**
 * Product domain models (Annex A1.5).
 *
 * These describe the fields the application actually reads from DummyJSON.
 * PRD rule 4 requires the types to match what is really implemented, so a
 * field appears here only once something uses it.
 */

/** One review, as DummyJSON returns it and as the review form writes it. */
export interface Review {
  rating: number
  comment: string
  /** ISO 8601, so it sorts and parses without a format to agree on. */
  date: string
  reviewerName: string
}

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
  /** Present on `GET /products/:id`; absent from the list endpoints. */
  reviews?: Review[]
}

/** One entry of `GET /products/categories` (Annex A, P2.5). */
export interface Category {
  slug: string
  name: string
  url: string
}

/** Shape of `GET /products` and `GET /products/search`. */
export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}
