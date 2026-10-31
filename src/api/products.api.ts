/**
 * DummyJSON product endpoints (Annex A1.6).
 *
 * Each function names the shape it returns and hands the work to the shared
 * ApiClient, so the base URL and the failure handling are not repeated here.
 * Only product endpoints are called: login and order placement are local
 * simulations (PRD rules 6 and 7).
 */

import type { Category, Product, ProductsResponse } from '../types/product'
import type { CatalogParams } from '../types/api'
import { buildProductsPath } from '../utils/url'
import { ApiClient } from './ApiClient'

const api = new ApiClient('https://dummyjson.com')

/**
 * One screen of the catalogue, whichever endpoint the parameters imply.
 *
 * `signal` comes from the caller's effect cleanup: when the shopper types
 * another letter or moves to the next page, the request in flight is
 * abandoned so its answer cannot arrive late and overwrite a newer one.
 */
export function fetchCatalog(
  params: CatalogParams,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  return api.get<ProductsResponse>(buildProductsPath(params), signal)
}

/** The category list for the filter (Annex A, P2.5). */
export function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  return api.get<Category[]>('/products/categories', signal)
}

/** One product. A 404 surfaces as an ApiError the caller can recognise. */
export function fetchProductById(id: number, signal?: AbortSignal): Promise<Product> {
  return api.get<Product>(`/products/${id}`, signal)
}

/**
 * Up to four other products from the same category (Annex A, P3.5).
 *
 * Five are requested because one of them is usually the product being viewed,
 * which is then filtered out.
 */
export async function fetchRelated(
  category: string,
  excludeId: number,
  signal?: AbortSignal,
): Promise<Product[]> {
  const response = await api.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}?limit=5`,
    signal,
  )
  return response.products.filter((product) => product.id !== excludeId).slice(0, 4)
}
