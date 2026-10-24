import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  /** Extra utility classes for the wrapper, e.g. vertical padding. */
  className?: string
}

/**
 * The one horizontal frame of the application.
 *
 * Every page and both layout bars render through it, which is what keeps the
 * left and right margins equal on every screen (Annex A, O3).
 */
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
