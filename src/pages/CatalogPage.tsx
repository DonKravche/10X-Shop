import { useEffect, useState } from 'react'
import ProductGrid from '../components/product/ProductGrid'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import StateMessage from '../components/ui/StateMessage'
import { fetchProducts } from '../api/products.api'
import type { Product } from '../types/product'

type Status = 'loading' | 'success' | 'error'

/**
 * Annex A, P2. Loads the first page of products from DummyJSON and renders
 * them as cards.
 *
 * Search, category, sorting, pagination and URL state are FULL and are not
 * implemented, so the page requests a single fixed page of 12.
 */
export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    // Dropped if the component unmounts before the response arrives, so React
    // is never asked to set state on a component that is gone. In development
    // StrictMode mounts twice, and this is what stops the first response from
    // landing after the second mount.
    let ignore = false

    fetchProducts()
      .then((data) => {
        if (ignore) return
        setProducts(data.products)
        setTotal(data.total)
        setStatus('success')
      })
      .catch(() => {
        if (ignore) return
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <Container className="py-8">
      <PageHeader
        title="Catalog"
        description={
          status === 'success'
            ? `Showing ${products.length} of ${total} products`
            : undefined
        }
      />

      {status === 'loading' ? <StateMessage title="Loading products..." /> : null}

      {status === 'error' ? (
        <StateMessage
          tone="error"
          title="We could not load the products"
          description="The product service did not respond. Please check your connection and reload the page."
        />
      ) : null}

      {status === 'success' && products.length === 0 ? (
        <StateMessage
          title="No products found."
          description="There is nothing in the catalogue right now."
        />
      ) : null}

      {status === 'success' && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : null}
    </Container>
  )
}
