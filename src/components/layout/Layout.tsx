import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import ScrollToTop from './ScrollToTop'

/**
 * The single layout route (Annex A, P0.1): Header + <Outlet /> + Footer.
 *
 * Every page renders through here, so the header exists once in the codebase
 * instead of being repeated on each page.
 *
 * The error boundary sits around the Outlet rather than the whole app, so a
 * page that fails keeps the header and footer and the user can navigate away
 * instead of facing a dead screen. Keying it by pathname clears the fallback
 * on the next navigation, which otherwise would persist for the whole visit.
 */
export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
