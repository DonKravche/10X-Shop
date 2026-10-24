import type { ReactNode } from 'react'

interface StateMessageProps {
  title: string
  /** One sentence explaining what happened or what to do next. */
  description?: string
  /** Optional action, e.g. a link back to the catalogue. */
  children?: ReactNode
  tone?: 'neutral' | 'error'
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
}: StateMessageProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center"
    >
      <p
        className={`text-sm font-medium ${
          tone === 'error' ? 'text-red-700' : 'text-neutral-950'
        }`}
      >
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{description}</p>
      ) : null}
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  )
}
