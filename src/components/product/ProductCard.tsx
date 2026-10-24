import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import Button from '../ui/Button'
import ProductPrice from './ProductPrice'
import StockBadge from './StockBadge'

interface ProductCardProps {
  product: Product
  /**
   * Callback prop (Annex A, P2.3). The card does not know what adding to the
   * cart means; it reports the click and the page decides.
   */
  onAdd: (product: Product) => void
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
export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const isSoldOut = product.stock === 0

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

          {/* z-10 lifts the button above the title link's stretched hit area,
              so clicking Add to cart does not also open the product. */}
          <Button
            variant="secondary"
            fullWidth
            disabled={isSoldOut}
            onClick={() => onAdd(product)}
            className="relative z-10 mt-1"
          >
            {isSoldOut ? 'Out of stock' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </article>
  )
}
