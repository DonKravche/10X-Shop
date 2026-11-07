import type { Coordinates } from '../types/storage'

/** Mean radius of the Earth, which is what turns an angle into kilometres. */
const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * The great-circle distance between two points, in kilometres.
 *
 * The haversine formula. It is the distance a bird flies, not the distance a
 * van drives, which on a real road network is usually 20-30% further; the
 * shop charges by this one because it needs no routing service and it is the
 * same answer every time, which a delivery charge has to be.
 *
 * Pure and typed, so it can be checked by passing it two known cities:
 * Tbilisi to Rustavi comes out at about 23 km, Tbilisi to Poti at about 265.
 */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLon = toRadians(to.lon - from.lon)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}
