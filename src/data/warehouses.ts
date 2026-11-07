import type { Warehouse } from '../types/storage'

/**
 * Where the shop keeps its stock, and what each place holds.
 *
 * The taxonomy is by category: a warehouse lists the DummyJSON categories it
 * stocks, which is how any product finds its storage location without the
 * API having to know anything about warehouses. Two categories are stocked
 * in more than one place on purpose - `sunglasses` and `groceries` - because
 * a shop with exactly one source per product never has to choose, and
 * choosing the nearest one is the thing being built.
 *
 * Every one of DummyJSON's 24 categories appears at least once. A category
 * that does not - a new one, or a cart line saved before categories were
 * recorded - falls back to the warehouse marked `isDefault`.
 */
export const WAREHOUSES: Warehouse[] = [
  {
    id: 'tbilisi-central',
    name: 'Tbilisi Central',
    city: 'tbilisi',
    isDefault: true,
    categories: [
      'smartphones',
      'laptops',
      'tablets',
      'mobile-accessories',
      'mens-watches',
      'womens-watches',
      'sunglasses',
      'groceries',
    ],
  },
  {
    id: 'batumi-port',
    name: 'Batumi Port',
    city: 'batumi',
    categories: [
      'beauty',
      'fragrances',
      'skin-care',
      'womens-bags',
      'womens-jewellery',
      'sunglasses',
    ],
  },
  {
    id: 'kutaisi-depot',
    name: 'Kutaisi Depot',
    city: 'kutaisi',
    categories: ['furniture', 'home-decoration', 'kitchen-accessories', 'groceries'],
  },
  {
    id: 'rustavi-industrial',
    name: 'Rustavi Industrial',
    city: 'rustavi',
    categories: ['vehicle', 'motorcycle', 'sports-accessories'],
  },
  {
    id: 'poti-harbour',
    name: 'Poti Harbour',
    city: 'poti',
    categories: ['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'tops'],
  },
]

/**
 * The warehouse everything unrecognised ships from.
 *
 * Found by the flag rather than by naming an id here, so moving the default
 * to another warehouse is one edit in the table above and not two.
 */
export const DEFAULT_WAREHOUSE: Warehouse =
  WAREHOUSES.find((warehouse) => warehouse.isDefault === true) ?? WAREHOUSES[0]

/** Every warehouse holding this category, which may be none. */
export function warehousesStocking(category: string): Warehouse[] {
  return WAREHOUSES.filter((warehouse) => warehouse.categories.includes(category))
}
