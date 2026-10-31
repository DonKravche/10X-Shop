/**
 * DummyJSON product endpoints (Annex A1.6).
 *
 * Each function names the shape it returns and hands the work to the shared
 * ApiClient, so the base URL and the failure handling are not repeated here.
 * Only product endpoints are called: login and order placement are local
 * simulations (PRD rules 6 and 7).
 */

import type { Category, CategoryShowcase, Product, ProductsResponse } from '../types/product'
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

/** The fields the storefront needs, and nothing else. */
interface StorefrontProbe {
  id: number
  title: string
  category: string
  thumbnail: string
}

export interface Storefront {
  categories: CategoryShowcase[]
  /** A spread of the stock, for the landing page's contact sheet. */
  sheet: { id: number; title: string; thumbnail: string }[]
}

/**
 * Everything the landing page shows, in one request plus the category names.
 *
 * `limit=0` asks for the whole catalogue and `select` narrows each row to
 * four fields, so all 194 products arrive as a few tens of kilobytes. That is
 * one request where a category picture each would have been twenty-four, and
 * it is also what makes the counts real rather than claimed.
 *
 * The sheet is sampled across the response at an even stride rather than
 * taken from the front, because the response is ordered by category: the
 * first forty products would all be cosmetics, and the whole point of the
 * sheet is that the range is unalike.
 */
export async function fetchStorefront(signal?: AbortSignal): Promise<Storefront> {
  const [response, categories] = await Promise.all([
    api.get<{ products: StorefrontProbe[] }>(
      '/products?limit=0&select=id,title,category,thumbnail',
      signal,
    ),
    fetchCategories(signal),
  ])

  const names = new Map(categories.map((entry) => [entry.slug, entry.name]))
  const grouped = new Map<string, { thumbnail: string; count: number }>()

  for (const product of response.products) {
    const existing = grouped.get(product.category)
    if (existing === undefined) {
      grouped.set(product.category, { thumbnail: product.thumbnail, count: 1 })
    } else {
      existing.count += 1
    }
  }

  const showcase = [...grouped.entries()]
    .map(([slug, { thumbnail, count }]) => ({
      slug,
      name: names.get(slug) ?? slug,
      thumbnail,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const wanted = 48
  const stride = Math.max(Math.floor(response.products.length / wanted), 1)
  const sheet = response.products
    .filter((_, index) => index % stride === 0)
    .slice(0, wanted)
    .map(({ id, title, thumbnail }) => ({ id, title, thumbnail }))

  return { categories: showcase, sheet }
}

/** Every category with a picture and a count (the catalogue's strip). */
export async function fetchCategoryShowcase(
  signal?: AbortSignal,
): Promise<CategoryShowcase[]> {
  return (await fetchStorefront(signal)).categories
}
