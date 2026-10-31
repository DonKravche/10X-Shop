import type { ReactNode } from 'react'

interface StateMessageProps {
  title: string
  /** One sentence explaining what happened or what to do next. */
  description?: string
  /** Optional action, e.g. a link back to the catalogue. */
  children?: ReactNode
  tone?: 'neutral' | 'error'
  /**
   * Centre the panel in the space the page has left, used when this message
   * is the whole body of a screen. Without it a short state sits at the top
   * with a long empty band between it and the footer.
   *
   * The panel keeps its own height: a card that stretches to fill a screen
   * only ends up holding a blank band of its own.
   */
  fill?: boolean
}

/**
 * The shared loading / error / empty state (Annex A, P0.6).
 *
 * One component for all three keeps the three states looking like one system
 * and guarantees none of them is silently missing from a screen.
 *
 * `role="status"` announces the change to assistive technology, so a screen
 * reader hears "Loading products" instead of sitting on a page that appears
 * not to have changed.
 */
export default function StateMessage({
  title,
  description,
  children,
  tone = 'neutral',
  fill = false,
}: StateMessageProps) {
  const panel = (
    <div
      role="status"
      className="rounded-lg border border-line bg-surface px-6 py-12 text-center"
    >
      <p
        className={`text-sm font-medium ${
          tone === 'error' ? 'text-red-700 dark:text-red-400' : 'text-ink'
        }`}
      >
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-subtle">{description}</p>
      ) : null}
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  )

  if (!fill) return panel

  // A column, so the panel still spans the page's width and only its vertical
  // position is centred.
  return <div className="flex flex-1 flex-col justify-center">{panel}</div>
}
