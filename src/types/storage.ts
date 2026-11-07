/**
 * Storage locations and what delivery from them costs.
 *
 * The shop keeps its stock in a handful of warehouses rather than nowhere in
 * particular, so an order has somewhere to travel from. Which warehouse a
 * product sits in is decided by its category - the taxonomy in
 * `src/data/warehouses.ts` - and what the journey costs is decided by the
 * distance between that warehouse's city and the customer's.
 */

/** A point on the globe, in degrees. */
export interface Coordinates {
  lat: number
  lon: number
}

/** A city the shop delivers to, and possibly stores goods in. */
export interface City {
  /** Lowercase, url-safe, and the value a select carries. */
  slug: string
  name: string
  coordinates: Coordinates
}

/**
 * One storage facility.
 *
 * It has no coordinates of its own: it is in a city, and the city has them.
 * Repeating the pair here would be two sources of truth for one place, and
 * the first edit to either would make "is this warehouse in the customer's
 * city" and "how far is it" disagree.
 */
export interface Warehouse {
  id: string
  name: string
  /** The slug of the city it stands in. */
  city: string
  /** The product categories stocked here. A category may be in several. */
  categories: string[]
  /**
   * Where anything falls back to when no warehouse lists its category -
   * a category DummyJSON adds after this was written, or a cart line saved
   * before categories were recorded. Exactly one warehouse carries it.
   */
  isDefault?: boolean
}

/**
 * One journey, from one warehouse to the customer.
 *
 * Plain data with no nested `Warehouse`, because this is written onto the
 * order and read back out of localStorage: an order has to keep showing the
 * journey it was actually charged for, even after the taxonomy changes
 * underneath it.
 */
export interface DeliveryLeg {
  warehouseId: string
  warehouseName: string
  /** The name of the city the goods leave from. */
  from: string
  /** Whole kilometres, which is what is charged for. */
  distanceKm: number
  cost: number
  /** The product titles travelling on this leg. */
  items: string[]
}

/** Every journey one basket needs, and what they come to together. */
export interface DeliveryPlan {
  /** The city chosen, or null while none has been. */
  destination: City | null
  legs: DeliveryLeg[]
  total: number
}
