/**
 * An HTTP failure carrying the status that caused it (Annex A, T4).
 *
 * A plain `Error` only has a message, so a caller cannot tell "this product
 * does not exist" from "the network is down" without parsing text. Keeping
 * the status lets each screen decide: 404 becomes the Not found page,
 * anything else becomes a retryable error state.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    // Subclassing a built-in loses the constructor name in the stack unless
    // it is set explicitly, which makes these hard to spot in the console.
    this.name = 'ApiError'
  }
}

/**
 * Type guard (Annex A, T3).
 *
 * `catch (error)` gives `unknown`, and `unknown` has no `.status`. This is
 * what narrows it, rather than an `as ApiError` cast that would compile
 * happily and then read `undefined` at runtime.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
