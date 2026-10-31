import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/auth-context'
import type { LoginFormValues } from '../types/user'
import { PASSWORD_MIN_LENGTH } from '../utils/validation'

const EMPTY_FORM: LoginFormValues = { username: '', password: '' }

/**
 * The login rules as a Yup schema (Annex A, P1 FULL).
 *
 * The same rules `validateLogin` states by hand in utils/validation.ts, and
 * deliberately the same messages: the specification fixes those strings, and
 * a schema that reworded them would be a different form wearing the same
 * label. Checkout, sign up and the profile keep the hand-written validators -
 * Formik is required on Login specifically, and converting the rest would add
 * a dependency to code that does not need one.
 */
const loginSchema = Yup.object({
  username: Yup.string().trim().required('Username is required'),
  password: Yup.string()
    .required('Password is required')
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    ),
})

/**
 * Annex A, P1. Sign in.
 *
 * Formik holds the values, the touched flags, the errors and the submission
 * state; Yup decides what is valid. The inputs are still controlled React
 * inputs - Formik's handleChange is an onChange like any other - so nothing
 * about the data flow changes, only who keeps the bookkeeping.
 *
 * No credentials are checked against a server. Any non-empty username with a
 * password of at least six characters signs in, unless that username was
 * claimed through sign up, in which case its own password is required
 * (A1.6, PRD rule 6).
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Where to go after signing in: back to the guarded page that sent the user
   * here, otherwise the catalogue (P1.3) - which is /catalog now that / is the
   * landing page.
   */
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/catalog'

  const formik = useFormik<LoginFormValues>({
    initialValues: EMPTY_FORM,
    validationSchema: loginSchema,
    // Validated on submit rather than on every keystroke, so a half-typed
    // password is not reported as too short while it is being typed.
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      // A claimed username is held to its password; anything else signs in,
      // which is what A1.6 requires of this demo.
      const result = await login(values.username, values.password)

      if (!result.ok) {
        // The context answers with the field its message belongs under, so
        // it lands beside the right input instead of as a banner.
        helpers.setFieldError(result.field, result.message)
        helpers.setFieldTouched(result.field, true, false)
        return
      }

      navigate(redirectTo, { replace: true })
    },
  })

  /** Formik reports an error for a field only once it has been touched. */
  const errorFor = (field: keyof LoginFormValues): string | undefined =>
    formik.touched[field] === true ? formik.errors[field] : undefined

  return (
    // Centred in the space the layout leaves, so the form sits in the middle
    // of the screen rather than at the top of a tall empty band.
    <Container className="flex flex-1 flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Log in</h1>
        <p className="mt-1 text-sm text-subtle">Sign in to place your order.</p>
        <p className="mt-3 text-sm text-muted">
          This is a demo shop, so any username works. If you created an account
          here, use the password you chose.
        </p>

        <form onSubmit={formik.handleSubmit} noValidate className="mt-8">
          <FormField
            id="username"
            name="username"
            label="Username"
            type="text"
            autoComplete="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errorFor('username')}
          />

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            className="mt-5"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errorFor('password')}
          />

          <Button
            type="submit"
            fullWidth
            disabled={formik.isSubmitting}
            className="mt-8"
          >
            Log In
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account yet?{' '}
          <Link
            to="/signup"
            // Carries the guarded destination through, so signing up from
            // here still returns the visitor to checkout.
            state={location.state}
            className="rounded-sm font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Create one
          </Link>
        </p>

        <Link
          to="/catalog"
          className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          &larr; Back to catalog
        </Link>
      </div>
    </Container>
  )
}
