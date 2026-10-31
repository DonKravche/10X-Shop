import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import PageHeader from '../components/ui/PageHeader'
import OrderStatusBadge from '../components/order/OrderStatusBadge'
import {
  ArrowRightIcon,
  LogOutIcon,
  MoonIcon,
  OrdersIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
} from '../components/ui/icons'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import { useTheme } from '../context/theme-context'
import { useToast } from '../context/toast-context'
import { useNow } from '../hooks/useNow'
import { OrderModel, readOrders } from '../models/Order'
import { cartStorage, orderStorage, reviewStorage } from '../models/storage'
import { formatDate, formatPrice } from '../utils/format'
import type { ProfileFormErrors, ProfileFormValues } from '../utils/validation'
import { hasErrors, validateProfile } from '../utils/validation'

const RECHECK_MS = 30_000

/**
 * Annex A, P7. The profile.
 *
 * Everything here is local (PRD rule 6): there is no user endpoint to read
 * from or write to, so the form edits React state, and the theme and the
 * stored data are the only things that outlive the session.
 *
 * The page opens with what the account actually has - what has been spent,
 * how many orders, the most recent one - rather than with an empty form. A
 * profile whose first screen is four blank fields tells the person nothing
 * they did not already know.
 */
export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { clear, itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const now = useNow(RECHECK_MS)

  const [orders, setOrders] = useState(() => readOrders(orderStorage.get()))

  const [values, setValues] = useState<ProfileFormValues>({
    firstName: user.username,
    lastName: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [savedName, setSavedName] = useState<string | null>(null)

  /** What the account amounts to, counted from the orders themselves. */
  const summary = useMemo(() => {
    const spent = orders.reduce((total, order) => total + order.total, 0)
    const items = orders.reduce(
      (count, order) => count + new OrderModel(order).itemCount,
      0,
    )
    return { spent, items, latest: orders[0] ?? null }
  }, [orders])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProfile(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    // P7 keeps this in React state. The name is echoed into the page title so
    // a save is visible as something other than a message that disappears.
    setSavedName(`${values.firstName.trim()} ${values.lastName.trim()}`.trim())
    showToast('Profile updated')
  }

  /**
   * P7: clears the cart, the orders and the reviews, and keeps the session
   * and the theme. Destructive, so it asks first.
   */
  function handleClearData() {
    if (!window.confirm('Clear your cart, orders and reviews? This cannot be undone.')) {
      return
    }

    clear()
    cartStorage.remove()
    orderStorage.remove()
    reviewStorage.remove()
    setOrders([])
    showToast('Local data cleared')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <Container className="py-8">
      <PageHeader
        title={savedName ?? user.username}
        description={`Signed in as ${user.username}`}
      />

      {/*
        What the account amounts to, before the form. Three figures counted
        from the orders rather than claimed, divided by rules inside one
        panel rather than split into three tiles - the app rules prefer one
        divided container to a row of cards.
      */}
      <dl className="grid grid-cols-1 divide-y divide-line rounded-lg border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <dt className="text-[13px] text-muted">Orders placed</dt>
          <dd className="mt-1 text-2xl tabular-nums text-ink">{orders.length}</dd>
        </div>
        <div className="p-5">
          <dt className="text-[13px] text-muted">Items bought</dt>
          <dd className="mt-1 text-2xl tabular-nums text-ink">{summary.items}</dd>
        </div>
        <div className="p-5">
          <dt className="text-[13px] text-muted">Spent in total</dt>
          <dd className="mt-1 text-2xl tabular-nums text-ink">
            {formatPrice(summary.spent)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate>
            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-medium text-ink">
                <UserIcon size={18} className="text-muted" />
                Your details
              </h2>
              <p className="mt-1 text-sm text-subtle">
                Kept in this browser for the session. Nothing is sent anywhere.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  id="firstName"
                  name="firstName"
                  label="First name"
                  type="text"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
                <FormField
                  id="lastName"
                  name="lastName"
                  label="Last name"
                  type="text"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
                <FormField
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  className="sm:col-span-2"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <FormField
                  id="phone"
                  name="phone"
                  label="Phone (optional)"
                  type="tel"
                  autoComplete="tel"
                  className="sm:col-span-2"
                  value={values.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
              </div>

              <Button type="submit" className="mt-6">
                Save changes
              </Button>
            </div>
          </form>

          {/* The most recent order: the thing a profile is most often opened
              to check, so it is on the profile rather than one click away. */}
          <section className="mt-8 rounded-lg border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 text-base font-medium text-ink">
              <OrdersIcon size={18} className="text-muted" />
              Latest order
            </h2>

            {summary.latest === null ? (
              <>
                <p className="mt-2 text-sm text-muted">
                  Nothing ordered yet.
                  {itemCount > 0
                    ? ` There ${itemCount === 1 ? 'is' : 'are'} ${itemCount} ${
                        itemCount === 1 ? 'item' : 'items'
                      } waiting in your cart.`
                    : ''}
                </p>
                <Link
                  to={itemCount > 0 ? '/cart' : '/catalog'}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {itemCount > 0 ? 'Go to your cart' : 'Browse the catalog'}
                  <ArrowRightIcon size={16} />
                </Link>
              </>
            ) : (
              <Link
                to={`/orders/${summary.latest.id}`}
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-4 transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span>
                  <span className="block text-sm font-medium text-ink">
                    #{summary.latest.number}
                  </span>
                  <span className="mt-1 block text-sm text-subtle">
                    {formatDate(summary.latest.placedAt)}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <OrderStatusBadge status={OrderModel.statusOf(summary.latest, now)} />
                  <span className="text-base font-bold tabular-nums text-ink">
                    {formatPrice(summary.latest.total)}
                  </span>
                </span>
              </Link>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 text-base font-medium text-ink">
              {theme === 'dark' ? (
                <MoonIcon size={18} className="text-muted" />
              ) : (
                <SunIcon size={18} className="text-muted" />
              )}
              Appearance
            </h2>
            <p className="mt-2 text-sm text-muted">
              Currently {theme}. Remembered on this device.
            </p>
            {/* The same ThemeContext the header switches - P7 is explicit
                that a second implementation must not exist. */}
            <Button variant="secondary" onClick={toggleTheme} className="mt-4 w-full">
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 text-base font-medium text-ink">
              <TrashIcon size={18} className="text-muted" />
              Local data
            </h2>
            <p className="mt-2 text-sm text-muted">
              Removes the cart, the orders and the reviews saved in this browser.
              Your session and your theme are kept.
            </p>
            <Button variant="secondary" onClick={handleClearData} className="mt-4 w-full">
              Clear local data
            </Button>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 text-base font-medium text-ink">
              <LogOutIcon size={18} className="text-muted" />
              Session
            </h2>
            <p className="mt-2 text-sm text-muted">
              Your cart and your orders stay on this device.
            </p>
            <Button variant="secondary" onClick={handleLogout} className="mt-4 w-full">
              Log out
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  )
}
