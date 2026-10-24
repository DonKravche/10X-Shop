import Container from '../ui/Container'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <Container className="py-8">
        <p className="text-sm text-neutral-500">
          10X Shop — a student project. Product data from{' '}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-neutral-950 underline underline-offset-2 hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            DummyJSON
          </a>
          . No real orders are placed and no payments are taken.
        </p>
      </Container>
    </footer>
  )
}
