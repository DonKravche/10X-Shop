import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Annex A, O2. Catches a render error below it and shows a fallback instead
 * of letting React unmount the tree and leave a blank white page.
 *
 * This is the one class component in the codebase, because error boundaries
 * have no hook equivalent: only getDerivedStateFromError and
 * componentDidCatch can intercept a render error.
 *
 * It does not catch errors thrown in event handlers, in async callbacks or
 * during server rendering - React does not route those through a boundary,
 * which is why fetch failures are handled with explicit error state instead.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  /** Runs during render: returns the next state, no side effects allowed. */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  /** Runs after the fallback is committed: the place for side effects. */
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Only in development. O2 requires that no console noise survives into
    // the production bundle; a real deployment would send this to an error
    // reporting service instead.
    if (import.meta.env.DEV) {
      console.error('Render error caught by ErrorBoundary:', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Something went wrong.
            </h1>
            <p className="mt-2 text-sm text-muted">
              This page could not be displayed. Reloading usually fixes it.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-surface transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
