/**
 * DummyJSON product API (Annex A1.6).
 *
 * CORE loads data with plain `fetch` inside dedicated, typed functions. The
 * generic `ApiClient` class and `ApiError` are FULL and are not used here.
 *
 * Only the product endpoints are called. There is no auth endpoint and no
 * `POST /carts/add`: login and order placement are local simulations
 * (PRD rules 6 and 7).
 *
 * Requests are not aborted. P2.2 brackets AbortController as FULL, where it
 * exists to stop a stale search response overtaking a newer one; CORE has no
 * filters to race, so callers drop late responses with an `ignore` flag in
 * their effect cleanup instead.
 */

import type { Product, ProductsResponse } from '../types/product'

const BASE_URL = 'https://dummyjson.com'

/** Products shown per catalogue page (Annex A1.6). */
export const PRODUCTS_PER_PAGE = 12

/**
 * Reads a response as JSON, failing loudly with a readable message so the UI
 * can show a real error state instead of rendering `undefined`.
 */
async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

/** `GET /products?limit=12&skip=0`. */
export async function fetchProducts(): Promise<ProductsResponse> {
  const response = await fetch(`${BASE_URL}/products?limit=${PRODUCTS_PER_PAGE}&skip=0`)
  return readJson<ProductsResponse>(response)
}

/**
 * `GET /products/:id`.
 *
 * Returns `null` when the product does not exist (HTTP 404) so the caller can
 * show the Not found page, and throws for every other failure so the caller
 * can show an error state. Distinguishing the two is what keeps "this product
 * is gone" from looking like "the network is down".
 */
export async function fetchProductById(id: number): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/products/${id}`)

  if (response.status === 404) {
    return null
  }

  return readJson<Product>(response)
}
