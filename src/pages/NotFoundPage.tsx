import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'

/**
 * Annex A, P0.1. The same page answers an unknown route, an unknown product
 * id and a non-numeric product id, so a bad URL never shows a blank screen.
 * The heading, body text and link label are the exact strings the spec fixes.
 */
export default function NotFoundPage() {
  return (
    <Container className="py-20">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        >
          Go to catalog
        </Link>
      </div>
    </Container>
  )
}
