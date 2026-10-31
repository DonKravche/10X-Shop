import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import OrderStatusBadge from '../components/order/OrderStatusBadge'
import Container from '../components/ui/Container'
import PageHeader from '../components/ui/PageHeader'
import StateMessage from '../components/ui/StateMessage'
import { useNow } from '../hooks/useNow'
import { OrderModel, readOrders } from '../models/Order'
import { orderStorage } from '../models/storage'
import { formatDate, formatPrice } from '../utils/format'

/** P6.2: statuses are recomputed every 30 seconds. */
const RECHECK_MS = 30_000

/**
 * Annex A, P6.1. Orders placed in this browser, newest first.
 *
 * Nothing is fetched: orders only ever existed locally (PRD rule 7). They are
 * read once on mount, because nothing else in the application writes to
 * `shop_orders` while this page is open.
 */
export default function OrdersPage() {
  const [orders] = useState(() => readOrders(orderStorage.get()))

  // The only thing that changes while this page is open is the time, which
  // is what moves an order from Processing to Shipped in front of the
  // customer without a reload (P6.2).
  const now = useNow(RECHECK_MS)

  const rows = useMemo(
    () =>
      orders.map((order) => ({
        order,
        status: OrderModel.statusOf(order, now),
        itemCount: new OrderModel(order).itemCount,
      })),
    [orders, now],
  )

  if (orders.length === 0) {
    return (
      <Container className="flex flex-1 flex-col py-8">
        <PageHeader title="Orders" />
        <StateMessage fill title="You have no orders yet.">
          <Link
            to="/catalog"
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-surface transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Browse products
          </Link>
        </StateMessage>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Orders"
        description={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
      />

      <ul className="space-y-3">
        {rows.map(({ order, status, itemCount }) => (
          <li key={order.id}>
            <Link
              to={`/orders/${order.id}`}
              className="block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    #{order.number}
                  </p>
                  <p className="mt-1 text-sm text-subtle">
                    {formatDate(order.placedAt)} &middot; {itemCount}{' '}
                    {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={status} />
                  <p className="text-base font-bold tabular-nums text-ink">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
