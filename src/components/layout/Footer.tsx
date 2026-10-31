import Container from '../ui/Container'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="py-8">
        <p className="text-sm text-subtle">
          10X Shop — a student project. Product data from{' '}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-ink underline underline-offset-2 hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            DummyJSON
          </a>
          . No real orders are placed and no payments are taken.
        </p>
      </Container>
    </footer>
  )
}
