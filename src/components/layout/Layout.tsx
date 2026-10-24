import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import ScrollToTop from './ScrollToTop'

/**
 * The single layout route (Annex A, P0.1): Header + <Outlet /> + Footer.
 *
 * Every page renders through here, so the header exists once in the codebase
 * instead of being repeated on each page.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
