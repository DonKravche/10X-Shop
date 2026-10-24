import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** One short sentence about the data on this screen, never about the UI. */
  description?: string
  /** Optional actions, rendered at the right of the title row on desktop. */
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
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  )
}
