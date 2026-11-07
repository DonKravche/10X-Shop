import { CITIES } from '../../data/cities'
import { Delivery } from '../../models/Delivery'
import type { DeliveryLeg } from '../../types/storage'
import { formatPrice } from '../../utils/format'

interface DeliveryPanelProps {
  /** The chosen city's slug, or '' while none has been chosen. */
  destination: string
  onDestinationChange: (slug: string) => void
  legs: DeliveryLeg[]
  /** The id of the select, so a page can label and validate it. */
  id?: string
  error?: string
}

/**
 * Where the order goes, and what each part of it costs to get there.
 *
 * One component for the cart and the checkout, reading the same legs from
 * the same Cart, so the two screens cannot quote different journeys or
 * different charges for the same basket.
 *
 * The journeys are shown rather than summed into one figure because the
 * charge is otherwise unexplainable: a shopper in Tbilisi who adds a pair of
 * shoes watches the delivery jump, and the only honest answer is that shoes
 * are kept in Poti and Poti is 265 km away.
 */
export default function DeliveryPanel({
  destination,
  onDestinationChange,
  legs,
  id = 'destination',
  error,
}: DeliveryPanelProps) {
  const chosen = destination !== ''

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        Deliver to
      </label>
      <select
        id={id}
        name="destination"
        value={destination}
        onChange={(event) => onDestinationChange(event.target.value)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 min-h-11 w-full rounded-md border border-strong bg-surface px-3 text-sm text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <option value="">Choose a city</option>
        {CITIES.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!chosen ? (
        <p className="mt-3 text-sm text-muted">
          Delivery is charged by the distance from the warehouse that stocks
          each item, at {formatPrice(Delivery.RATE_PER_KM)} per kilometre.
          Anything already in your city is free.
        </p>
      ) : null}

      {chosen && legs.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-line pt-4">
          {legs.map((leg) => (
            <li key={leg.warehouseId} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-ink">{leg.warehouseName}</span>
                <span className="shrink-0 tabular-nums text-ink">
                  {leg.cost === 0 ? 'Free' : formatPrice(leg.cost)}
                </span>
              </div>
              <p className="mt-0.5 text-muted">
                {leg.distanceKm === 0
                  ? `In ${leg.from}, so nothing to travel`
                  : `${leg.from} to here, ${leg.distanceKm} km`}
              </p>
              {/* Which goods ride on this leg, so the figure is traceable to
                  the line that caused it. */}
              <p className="mt-0.5 text-xs text-subtle">{leg.items.join(', ')}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
