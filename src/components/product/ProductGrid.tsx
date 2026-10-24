import type { Product } from '../../types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

/**
 * The responsive product grid (Annex A, P2.1 and O3).
 *
 * Columns: 1 on a phone, 2 from 640px, 3 on a tablet from 768px and 4 on a
 * desktop from 1024px — the breakpoints O3 asks for, written mobile-first.
 *
 * `key={product.id}` is the product's own stable identifier, not the array
 * index, so React keeps the right DOM node against the right product when the
 * list changes.
 */
export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
