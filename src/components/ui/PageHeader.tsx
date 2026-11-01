import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** One short sentence about the data on this screen, never about the UI. */
  description?: string
  /**
   * Optional controls, rendered at the right of the title row from 640px and
   * on their own line below it under that. Putting a screen's filters here
   * rather than in a row of their own closes the empty right half the title
   * would otherwise leave, and lifts the content up the screen.
   */
  children?: ReactNode
}

/**
 * The title row every screen opens with.
 *
 * Each page owns exactly one <h1>, which is what lets a screen reader (and a
 * reader) tell immediately which page they are on (Annex A, O3).
 */
export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-subtle">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex w-full items-center gap-2 sm:w-auto">{children}</div>
      ) : null}
    </div>
  )
}
