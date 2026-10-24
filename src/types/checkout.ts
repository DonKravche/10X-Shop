/**
 * Checkout models.
 *
 * CORE checkout is exactly four controlled fields (Annex A, P5.1 and P5.2).
 * The withdrawn schema in the P5.2 table (phone, postal code, country, card
 * number, expiry, CVC) is not implemented: PRD rule 3 gives precedence to the
 * CORE/FULL definition over the detailed example, and PRD rule 7 rules out any
 * payment handling.
 *
 * The matching `Order` model lives in the FULL scope and is not created yet.
 */

export interface CheckoutFormValues {
  fullName: string
  email: string
  address: string
  city: string
}

/** One optional message per field, keyed by the field it belongs to. */
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>

/** Local, client-side summary of a placed order. Never sent to a server. */
export interface OrderSummary {
  itemCount: number
  total: number
  shipping: CheckoutFormValues
}
