import { Link } from 'react-router-dom'
import type { CategoryShowcase } from '../../types/product'

interface CategoryCardProps {
  category: CategoryShowcase
  /** `lg` on the landing sheet, `sm` in the catalogue's strip. */
  size?: 'sm' | 'lg'
}

/**
 * One category, shown by a product from inside it.
 *
 * The picture is a real product photograph, not an illustration of the idea
 * of a category: a shopper recognises "furniture" faster from a chair than
 * from the word. It links into the catalogue filtered to that category,
 * which is a URL the catalogue already understood (P2.5, P2.8) - this adds a
 * way in, not a second mechanism.
 *
 * The whole card is one link rather than a card wrapping a link, so there is
 * exactly one focus stop per category and the hit area is the whole tile.
 */
export default function CategoryCard({ category, size = 'lg' }: CategoryCardProps) {
  const isLarge = size === 'lg'

  return (
    <Link
      to={`/catalog?category=${encodeURIComponent(category.slug)}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <div
        className={[
          'overflow-hidden rounded-lg border border-line bg-surface',
          isLarge ? 'aspect-4/3' : 'aspect-square',
        ].join(' ')}
      >
        <img
          src={category.thumbnail}
          alt=""
          width={400}
          height={300}
          loading="lazy"
          // Scale on hover rather than a shadow or a lift: the ledger style
          // keeps surfaces flat, so the picture itself is what responds.
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <p
        className={[
          'mt-2 font-medium text-ink',
          isLarge ? 'text-sm' : 'text-[13px]',
        ].join(' ')}
      >
        {category.name}
      </p>
      <p className="text-[13px] tabular-nums text-subtle">
        {category.count} {category.count === 1 ? 'product' : 'products'}
      </p>
    </Link>
  )
}
