import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useCart } from '../../context/cart-context'
import Container from '../ui/Container'

/*
 * Annex A, P0.3. The header is written once, inside Layout, and carries the
 * logo, Catalog, Cart and the login control. Orders, Profile and the theme
 * switch belong to FULL and are not shown.
 *
 * Below 640px the navigation wraps onto a second row rather than opening a
 * burger menu - P0.3 allows either, and a wrapped row cannot cause the
 * horizontal scrolling that O3 forbids.
 */

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    'inline-flex min-h-11 items-center rounded-md px-3 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
    isActive
      ? 'bg-neutral-100 font-medium text-neutral-950'
      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950',
  ].join(' ')

export default function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  /** Returns to the guest state and goes home. The cart is kept (P0.3). */
  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <Container>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 py-3">
          <Link
            to="/"
            className="mr-auto rounded-md text-lg font-bold tracking-tight text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            10X Shop
          </Link>

          <nav
            aria-label="Main"
            className="order-last flex w-full items-center gap-1 sm:order-none sm:w-auto"
          >
            <NavLink to="/" end className={linkClass}>
              Catalog
            </NavLink>
            <NavLink to="/cart" className={linkClass}>
              Cart
              {/* The badge is hidden at zero rather than showing "0" (P0.3). */}
              {itemCount > 0 ? (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-xs font-medium tabular-nums text-white">
                  {itemCount}
                </span>
              ) : null}
            </NavLink>
          </nav>

          {user.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-neutral-500 sm:inline">
                {user.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
              >
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}
        </div>
      </Container>
    </header>
  )
}
