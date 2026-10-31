import type { Review } from '../../types/product'
import { formatDate } from '../../utils/format'
import StarRating from './StarRating'

interface ReviewListProps {
  reviews: Review[]
}

/**
 * The reviews for one product (Annex A, P3.4).
 *
 * Reviews written in this browser come first - the newest at the top - then
 * the ones the API returned. The caller assembles that order; this component
 * only renders it.
 */
export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-6 text-sm text-subtle">
        No reviews yet. Be the first to write one.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-line">
      {reviews.map((review) => (
        // Composite key: two reviewers can share a name and one reviewer can
        // write twice, but not at the same instant on the same product.
        <li key={`${review.date}-${review.reviewerName}`} className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">{review.reviewerName}</p>
            <p className="text-sm text-subtle">{formatDate(review.date)}</p>
          </div>
          <div className="mt-1">
            <StarRating value={review.rating} />
          </div>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
            {review.comment}
          </p>
        </li>
      ))}
    </ul>
  )
}
