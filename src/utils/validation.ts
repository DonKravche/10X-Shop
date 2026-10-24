/**
 * Form validation (Annex A, P1.2 and P5.2).
 *
 * Every message below is the exact text the specification requires, so these
 * strings are the single source of truth for both forms.
 */

import type { CheckoutFormErrors, CheckoutFormValues } from '../types/checkout'
import type { LoginFormErrors, LoginFormValues } from '../types/user'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MIN_LENGTH = 6
const FULL_NAME_MIN_LENGTH = 3
const ADDRESS_MIN_LENGTH = 5

/** Login: username is required, password must be at least 6 characters. */
export function validateLogin(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}

  if (values.username.trim().length === 0) {
    errors.username = 'Username is required'
  }

  if (values.password.length === 0) {
    errors.password = 'Password is required'
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }

  return errors
}

/** Checkout: the four CORE shipping fields. */
export function validateCheckout(values: CheckoutFormValues): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}

  if (values.fullName.trim().length < FULL_NAME_MIN_LENGTH) {
    errors.fullName = `Full name must be at least ${FULL_NAME_MIN_LENGTH} characters`
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (values.address.trim().length < ADDRESS_MIN_LENGTH) {
    errors.address = `Address must be at least ${ADDRESS_MIN_LENGTH} characters`
  }

  if (values.city.trim().length === 0) {
    errors.city = 'City is required'
  }

  return errors
}

/** True when a validator returned at least one message. */
export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((message) => message !== undefined)
}
