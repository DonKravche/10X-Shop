import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/auth-context'
import type { SignUpFormErrors, SignUpFormValues } from '../types/user'
import { hasErrors, validateSignUp } from '../utils/validation'

const EMPTY_FORM: SignUpFormValues = {
  username: '',
  password: '',
  confirmPassword: '',
}

/**
 * Annex A, P1.1 — FULL: "Sign Up and password recovery".
 *
 * A controlled form, like Login: every value comes from state and every
 * keystroke goes through onChange. What it creates is a local account — a
 * claimed username and a digest of the password — kept in `shop_user`. There
 * is no server to register against (PRD rule 6), so this is a simulation;
 * what it simulates honestly is that a name can be taken and that the
 * password you choose is the one you will need.
 */
export default function SignUpPage() {
  const [values, setValues] = useState<SignUpFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<SignUpFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Where to go afterwards: back to the guarded page that sent the visitor to
   * sign in, otherwise the catalogue. Login carries the same state, so
   * arriving here from the login page keeps the destination.
   */
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/'

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Clear this field's message as soon as the visitor starts correcting it.
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Guards against a second submit while the first is being handled; the
    // button is disabled for the same reason.
    if (isSubmitting) return

    const nextErrors = validateSignUp(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setIsSubmitting(true)
    // Whether the name is taken is not something the validator can know, so
    // that answer comes back from the context.
    const result = await signUp(values.username, values.password)

    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      setIsSubmitting(false)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-subtle">
          This is a demo shop. Your account is kept in this browser only — no
          server sees it.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <FormField
            id="username"
            name="username"
            label="Username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            error={errors.username}
          />

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            className="mt-5"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <FormField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            className="mt-5"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button type="submit" fullWidth disabled={isSubmitting} className="mt-8">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="rounded-sm font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Log in
          </Link>
        </p>

        <Link
          to="/"
          className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          &larr; Back to catalog
        </Link>
      </div>
    </Container>
  )
}
