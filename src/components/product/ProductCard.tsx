import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import ProductPrice from './ProductPrice'
import StockBadge from './StockBadge'

interface ProductCardProps {
  product: Product
}

/**
 * One product in the catalogue grid (Annex A, P2.3).
 *
 * The title is the only link; `after:absolute after:inset-0` stretches its hit
 * area over the whole card, so the card is clickable everywhere while the
 * keyboard still sees a single, properly named link rather than a nest of
 * focusable elements.
 *
 * The image carries width/height and loading="lazy" so the grid reserves its
 * space before the picture arrives and does not shift as rows load (O1).
 */
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="relative flex w-full flex-col rounded-lg border border-neutral-200 bg-white transition-colors hover:border-neutral-400 focus-within:border-neutral-400">
      <div className="aspect-square overflow-hidden rounded-t-lg bg-neutral-50 p-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          width={400}
          height={400}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-neutral-200 p-4">
        <h3 className="text-sm font-medium text-neutral-950">
          <Link
            to={`/products/${product.id}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            {product.title}
          </Link>
        </h3>

        <p className="text-xs text-neutral-500">
          {product.category}
          {product.brand ? ` · ${product.brand}` : ''}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <ProductPrice
            price={product.price}
            discountPercentage={product.discountPercentage}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs tabular-nums text-neutral-500">
              &#9733; {product.rating.toFixed(1)}
            </span>
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </div>
    </article>
  )
}
