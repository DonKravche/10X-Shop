interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/**
 * Page numbers with an ellipsis where the run is long (Annex A, P2.7).
 *
 * Always shows the first page, the last page, the current page and one on
 * each side of it. The gaps between those become a single "…", so the control
 * stays the same width whether there are 3 pages or 300.
 */
function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  // A run of three around the current page, slid inside the range rather than
  // clipped at it - otherwise page 1 shows only "1 2" and the control that
  // P2.7 draws as "‹ 1 2 3 … N ›" comes out a number short at both ends.
  const start = Math.min(Math.max(page - 1, 1), Math.max(totalPages - 2, 1))
  const window = [start, start + 1, start + 2]

  const wanted = new Set<number>([1, totalPages, ...window])
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)

  const items: (number | 'gap')[] = []
  let previous = 0
  for (const current of pages) {
    // More than one page skipped: collapse the run rather than listing it.
    if (previous !== 0 && current - previous > 1) items.push('gap')
    items.push(current)
    previous = current
  }
  return items
}

const BUTTON =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm ' +
  'tabular-nums transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ' +
  'disabled:cursor-not-allowed disabled:text-neutral-300'

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  // One page is not a choice, so there is nothing to show.
  if (totalPages <= 1) return null

  const items = pageItems(page, totalPages)

  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            className={`${BUTTON} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 disabled:hover:bg-transparent`}
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
        </li>

        {items.map((item, index) =>
          item === 'gap' ? (
            // The key can use the index here: the gaps have no identity of
            // their own and never reorder relative to the numbers around them.
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-neutral-400">
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={
                  item === page
                    ? `${BUTTON} bg-neutral-950 font-medium text-white`
                    : `${BUTTON} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950`
                }
                onClick={() => onChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            className={`${BUTTON} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 disabled:hover:bg-transparent`}
            onClick={() => onChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
        </li>
      </ul>
    </nav>
  )
}
