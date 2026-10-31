import { ApiError } from './ApiError'

/**
 * One gateway to the HTTP API (Annex A, T4).
 *
 * Every request goes through `request`, so the base URL, the failure handling
 * and the JSON parsing are written once instead of in each endpoint function.
 * `get` is generic: the caller names the shape it expects and the result is
 * typed all the way back to the component.
 *
 * There is no `post`. The specification's skeleton shows one, but nothing in
 * this application sends anything: login and orders are local simulations
 * (PRD rules 6 and 7), so a POST method would be code that is never called.
 */
export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(this.baseUrl + path, init)

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `Request to ${path} failed with status ${response.status}`,
      )
    }

    return (await response.json()) as T
  }

  /**
   * `signal` lets a caller abandon a request whose answer is no longer
   * wanted - a search that has been typed past, a page that has been left.
   */
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, { signal })
  }
}
