interface StarRatingProps {
  /** 0-5; drawn to the nearest whole star. */
  value: number
  label?: string
}

/**
 * Five stars, filled to the rating (Annex A, P3.4).
 *
 * Drawn rather than written as text: the glyph is decorative, so the number
 * is what reaches a screen reader through the label, and `aria-hidden` keeps
 * five repeated characters out of the reading order.
 */
export default function StarRating({ value, label }: StarRatingProps) {
  const filled = Math.round(value)

  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden="true" className="text-sm leading-none tracking-tight">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={index < filled ? 'text-neutral-950' : 'text-neutral-300'}
          >
            &#9733;
          </span>
        ))}
      </span>
      <span className="sr-only">{label ?? `Rated ${value.toFixed(1)} out of 5`}</span>
    </span>
  )
}
