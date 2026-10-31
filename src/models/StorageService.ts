/**
 * The one gateway to localStorage (Annex A, T4).
 *
 * Generic, so each stored shape gets its own typed handle:
 * `new StorageService<CartState>(STORAGE_KEYS.cart)`. Writing the key once
 * per store is what stops a typo in one component silently reading a
 * different slot from the one another component writes.
 *
 * Every access is wrapped: `localStorage` throws in a private window with
 * site data blocked, and `JSON.parse` throws on anything hand-edited. A shop
 * must not go blank because a saved value was damaged.
 */
export class StorageService<T> {
  constructor(private readonly key: string) {}

  /**
   * The stored value, or null when there is nothing usable.
   *
   * The `T` here is a promise the caller makes, not one this class can keep:
   * JSON carries no types, so what comes back is whatever was written last,
   * possibly by an older version of the application or by hand. Callers that
   * care narrow the result with a type guard - see `isCartItem`.
   */
  get(): T | null {
    try {
      const raw = window.localStorage.getItem(this.key)
      return raw === null ? null : (JSON.parse(raw) as T)
    } catch {
      return null
    }
  }

  set(value: T): void {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value))
    } catch {
      // Quota exceeded, or storage blocked. The application keeps working
      // from memory, so a failed save must not surface as a crash.
    }
  }

  remove(): void {
    try {
      window.localStorage.removeItem(this.key)
    } catch {
      // As above.
    }
  }
}
