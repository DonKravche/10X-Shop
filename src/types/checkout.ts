/**
 * Checkout models.
 *
 * CORE checkout is exactly four controlled fields (Annex A, P5.1 and P5.2).
 * The withdrawn schema in the P5.2 table (phone, postal code, country, card
 * number, expiry, CVC) is not implemented: PRD rule 3 gives precedence to the
 * CORE/FULL definition over the detailed example, and PRD rule 7 rules out
 * any payment handling.
 */

import type { ShippingInfo } from './order'

/**
 * The form's values are exactly the shipping details an order carries, so
 * this is `ShippingInfo` rather than a second declaration of the same four
 * fields that could drift away from it.
 */
export type CheckoutFormValues = ShippingInfo

/** One optional message per field, keyed by the field it belongs to. */
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>
