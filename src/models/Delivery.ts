import { findCity } from '../data/cities'
import { DEFAULT_WAREHOUSE, warehousesStocking } from '../data/warehouses'
import type { CartItem } from '../types/cart'
import type { City, DeliveryLeg, DeliveryPlan, Warehouse } from '../types/storage'
import { distanceKm } from '../utils/distance'

/**
 * What it costs to bring a basket from storage to a customer.
 *
 * Every line in the cart is stocked somewhere. This works out where each one
 * comes from - the nearest warehouse that holds its category - groups the
 * lines by the place they leave from, and charges each journey by its
 * distance. Goods already in the customer's city travel nowhere and cost
 * nothing.
 *
 * Deliberately not a hook and not part of a component: it is arithmetic over
 * plain data, so the cart page, the checkout and the placed order can all ask
 * the same object and cannot quote different figures for the same basket.
 */
export class Delivery {
  /** What one kilometre costs. The whole pricing rule is this number. */
  static readonly RATE_PER_KM = 1

  private cached: DeliveryPlan | null = null

  constructor(
    private readonly items: CartItem[],
    /** The chosen city's slug, or null while the customer has not chosen. */
    private readonly destinationSlug: string | null,
  ) {}

  /**
   * Whole kilometres from a warehouse to the customer.
   *
   * Same city is zero by the rule, not by the arithmetic. A warehouse's
   * coordinates are its city's, so the formula would return zero anyway -
   * but only for as long as that stays true, and the rule is that goods
   * already in the city do not travel, not that the city is a single point.
   */
  static kilometresTo(warehouse: Warehouse, destination: City): number {
    if (warehouse.city === destination.slug) return 0

    const home = findCity(warehouse.city)
    // A warehouse in a city the shop does not list cannot have its distance
    // measured, so it is not charged for rather than charged a guess.
    if (home === undefined) return 0

    return Math.round(distanceKm(home.coordinates, destination.coordinates))
  }

  /**
   * The nearest warehouse stocking this category.
   *
   * This is the "closest storage facility" rule. Where a category is held in
   * several places - and two of them are - the one with the shortest journey
   * to this customer wins, so the same basket costs different amounts to
   * deliver to different cities.
   */
  static sourceFor(category: string, destination: City): Warehouse {
    const stocking = warehousesStocking(category)
    if (stocking.length === 0) return DEFAULT_WAREHOUSE

    return stocking.reduce((nearest, candidate) =>
      Delivery.kilometresTo(candidate, destination) <
      Delivery.kilometresTo(nearest, destination)
        ? candidate
        : nearest,
    )
  }

  /**
   * One journey per warehouse, cheapest first.
   *
   * Grouping by warehouse is what stops a basket of six things from one shelf
   * being charged six times: it is one van leaving one building. A basket
   * drawn from three warehouses is three journeys, because it genuinely is.
   */
  plan(): DeliveryPlan {
    if (this.cached !== null) return this.cached

    const destination =
      this.destinationSlug === null ? undefined : findCity(this.destinationSlug)

    if (destination === undefined || this.items.length === 0) {
      this.cached = { destination: destination ?? null, legs: [], total: 0 }
      return this.cached
    }

    const byWarehouse = new Map<string, DeliveryLeg>()

    for (const item of this.items) {
      const warehouse = Delivery.sourceFor(item.category, destination)
      const existing = byWarehouse.get(warehouse.id)

      if (existing !== undefined) {
        existing.items.push(item.title)
        continue
      }

      const km = Delivery.kilometresTo(warehouse, destination)
      byWarehouse.set(warehouse.id, {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        from: findCity(warehouse.city)?.name ?? warehouse.city,
        distanceKm: km,
        cost: km * Delivery.RATE_PER_KM,
        items: [item.title],
      })
    }

    const legs = [...byWarehouse.values()].sort(
      (a, b) => a.distanceKm - b.distanceKm || a.from.localeCompare(b.from),
    )

    this.cached = {
      destination,
      legs,
      total: legs.reduce((sum, leg) => sum + leg.cost, 0),
    }
    return this.cached
  }

  total(): number {
    return this.plan().total
  }
}
