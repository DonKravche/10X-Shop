import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { StorefrontProduct } from '../../api/products.api'
import { discountedPrice, formatPrice } from '../../utils/format'
import { ArrowRightIcon } from '../ui/icons'

interface ProductRunProps {
  /** Two to four words, the way a catalogue names a run of goods. */
  heading: string
  /** One line saying what put these products together, not a slogan. */
  note: string
  products: StorefrontProduct[]
  /** Which frame is lifted out of the row. Defaults to the first. */
  liftedIndex?: number
}

/**
 * A run of goods you scroll through, the way a catalogue spread is read.
 *
 * Deliberately not a card rail. The house rules ban rows of identical cards,
 * and the editorial answer is the direction's "frame run, one lifted": the
 * frames sit at one height on a shared baseline with one raised to about
 * twice it, so the row has a subject rather than being a conveyor of equal
 * tiles. Every product here is square, so varying the height is what varies
 * the width.
 *
 * It is a real scroll container, not a transform carousel: the native scroll
 * keeps the keyboard, the trackpad, a phone's thumb and the scrollbar working
 * for free, and `scroll-snap` is what makes the arrows land cleanly. A
 * JavaScript carousel would have had to rebuild all of that and would break
 * without script; this degrades to a scrollable row.
 */
export default function ProductRun({
  heading,
  note,
  products,
  liftedIndex = 0,
}: ProductRunProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  /** Which arrows are usable, read from the scroll position itself. */
  const measure = useCallback(() => {
    const track = trackRef.current
    if (track === null) return
    const max = track.scrollWidth - track.clientWidth
    setAtStart(track.scrollLeft <= 1)
    setAtEnd(track.scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    measure()
    const track = trackRef.current
    if (track === null) return

    // The row's own size decides whether there is anywhere to scroll, so the
    // arrows have to answer a resize as well as a scroll.
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [measure, products])

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current
    if (track === null) return
    // Most of a screen, so a press moves the spread on without losing the
    // frame the reader was looking at.
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  const ARROW =
    'inline-flex h-11 w-11 items-center justify-center rounded-md text-muted ' +
    'transition-colors hover:bg-ground hover:text-ink ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
    'disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent'

  return (
    <section className="py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-1 text-base text-muted">{note}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label={`Scroll ${heading} back`}
            className={ARROW}
          >
            <ArrowRightIcon size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label={`Scroll ${heading} on`}
            className={ARROW}
          >
            <ArrowRightIcon size={18} />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={measure}
        // items-end puts every frame on one baseline, so the lifted one
        // stands above the rest instead of floating in the middle.
        className="flex snap-x snap-mandatory items-end gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {products.map((product, index) => {
          const lifted = index === liftedIndex
          const payable = discountedPrice(product.price, product.discountPercentage)

          return (
            <li
              key={product.id}
              className={[
                'shrink-0 snap-start',
                lifted ? 'w-64 sm:w-80' : 'w-36 sm:w-44',
              ].join(' ')}
            >
              <Link
                to={`/products/${product.id}`}
                className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <div className="aspect-square overflow-hidden rounded-lg border border-line bg-surface">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>

                {/* The label strip a catalogue prints under its goods:
                    the name, then the figures in tabular type.

                    The name always occupies two lines, whether or not it
                    fills them. Clamped at two but free to be one, a short
                    name made its frame shorter, and because the row is
                    bottom-aligned that dropped the whole frame - picture and
                    all - by a line, so the pictures sat on three different
                    levels on a phone. `2lh` is two of this element's own line
                    boxes, so the lifted frame's larger type reserves its own
                    larger space without a second number to keep in step. */}
                <p
                  className={[
                    'mt-2 line-clamp-2 min-h-[2lh] font-medium text-ink',
                    lifted ? 'text-base' : 'text-[13px]',
                  ].join(' ')}
                >
                  {product.title}
                </p>
                {/* One line, always. Wrapping was the second thing knocking
                    the frames off their shared line: three figures do not fit
                    across a 144px frame, so the row became two lines and took
                    the picture up with it. */}
                <p className="mt-1 flex items-baseline gap-x-2 overflow-hidden text-[13px] whitespace-nowrap tabular-nums">
                  <span className="font-bold text-ink">{formatPrice(payable)}</span>
                  {product.discountPercentage >= 1 ? (
                    <>
                      {/* What the shopper would have paid. The small frames
                          drop it until there is room: the percentage beside it
                          already says there is a discount, and the price being
                          charged is the one figure that must never go. */}
                      <span
                        className={[
                          'text-subtle line-through',
                          lifted ? '' : 'hidden sm:inline',
                        ].join(' ')}
                      >
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-green-800 dark:text-green-400">
                        &minus;{Math.round(product.discountPercentage)}%
                      </span>
                    </>
                  ) : null}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
