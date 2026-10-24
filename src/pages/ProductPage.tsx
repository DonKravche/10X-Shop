import { useParams } from 'react-router-dom'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Container className="py-8">
      <PageHeader title={`Product ${id ?? ''}`} />
    </Container>
  )
}
