import { Link, NavLink } from 'react-router-dom'
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
            </NavLink>
          </nav>
        </div>
      </Container>
    </header>
  )
}
