import type { OrderStatus } from '../../types/order'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

/** P6.1 fixes the three colours: grey, blue, green. */
const TONES: Record<OrderStatus, string> = {
  Processing: 'bg-ground text-muted',
  Shipped: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  Delivered: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200',
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONES[status]}`}
    >
      {status}
    </span>
  )
}
