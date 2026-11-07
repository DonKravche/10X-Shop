import type { City } from '../types/storage'

/**
 * The cities the shop delivers to.
 *
 * Real coordinates, because the delivery charge is the distance between two
 * of them. A table of pre-written distances would need 28 entries for these
 * eight cities and a new row for every city added; two coordinates and one
 * formula need neither.
 *
 * Source: the OpenStreetMap coordinates of each city centre.
 */
export const CITIES: City[] = [
  { slug: 'tbilisi', name: 'Tbilisi', coordinates: { lat: 41.7151, lon: 44.8271 } },
  { slug: 'rustavi', name: 'Rustavi', coordinates: { lat: 41.5495, lon: 44.9931 } },
  { slug: 'gori', name: 'Gori', coordinates: { lat: 41.9842, lon: 44.1108 } },
  { slug: 'telavi', name: 'Telavi', coordinates: { lat: 41.9197, lon: 45.4731 } },
  { slug: 'kutaisi', name: 'Kutaisi', coordinates: { lat: 42.2679, lon: 42.7051 } },
  { slug: 'zugdidi', name: 'Zugdidi', coordinates: { lat: 42.5088, lon: 41.8709 } },
  { slug: 'poti', name: 'Poti', coordinates: { lat: 42.1462, lon: 41.6755 } },
  { slug: 'batumi', name: 'Batumi', coordinates: { lat: 41.6168, lon: 41.6367 } },
]

/** The city with this slug, or undefined for anything unrecognised. */
export function findCity(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug)
}

/** True when the slug names a city the shop delivers to (Annex A, T3). */
export function isCitySlug(value: unknown): value is string {
  return typeof value === 'string' && findCity(value) !== undefined
}
