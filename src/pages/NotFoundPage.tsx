import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'

/**
 * Annex A, P0.1. The same page answers an unknown route, an unknown product
 * id and a non-numeric product id, so a bad URL never shows a blank screen.
 * The heading, body text and link label are the exact strings the spec fixes.
 */
export default function NotFoundPage() {
  return (
    // Centred in the space the layout leaves, so a wrong URL does not land on
    // a short block with a tall empty band under it.
    <Container className="flex flex-1 flex-col justify-center py-20">
      {/* Centred like the login form, so the block has equal margins instead
          of sitting hard left with the rest of the screen empty. */}
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-surface transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Go to catalog
        </Link>
      </div>
    </Container>
  )
}
