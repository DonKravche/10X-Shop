import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary'
import StateMessage from '../ui/StateMessage'
import Container from '../ui/Container'
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
    <div className="flex min-h-screen flex-col bg-ground">
      <ScrollToTop />
      <Header />
      {/* A flex column, so a page with little content can grow to fill the
          window instead of leaving a dead strip above the footer. */}
      <main className="flex flex-1 flex-col">
        <ErrorBoundary key={pathname}>
          {/* One Suspense for every lazy route (O1): a page's chunk is
              fetched on its first visit, and this is what is on screen while
              it arrives. */}
          <Suspense
            fallback={
              <Container className="flex flex-1 flex-col py-8">
                <StateMessage fill title="Loading..." />
              </Container>
            }
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
