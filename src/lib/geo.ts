const EARTH_RADIUS_KM = 6371

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

/** Rectangular bbox (in degrees) that fully contains a circle of radiusKm around (lat, lon). */
export function boundingBoxForRadius(
  lat: number,
  lon: number,
  radiusKm: number,
): { minLon: number; minLat: number; maxLon: number; maxLat: number } {
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat)))
  return {
    minLon: lon - lonDelta,
    minLat: lat - latDelta,
    maxLon: lon + lonDelta,
    maxLat: lat + latDelta,
  }
}

/** Mulberry32 seeded PRNG — deterministic results for a given search. */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromCoords(lat: number, lon: number): number {
  return Math.floor((lat + 90) * 100000) ^ Math.floor((lon + 180) * 100000)
}

/** Random point uniformly distributed within a circle of radiusKm around (lat, lon). */
export function randomPointInRadius(
  lat: number,
  lon: number,
  radiusKm: number,
  rng: () => number,
): { lat: number; lon: number } {
  const distanceKm = radiusKm * Math.sqrt(rng())
  const bearing = rng() * 2 * Math.PI

  const latRad = toRadians(lat)
  const lonRad = toRadians(lon)
  const angularDistance = distanceKm / EARTH_RADIUS_KM

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
  )
  const newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad),
    )

  return {
    lat: (newLatRad * 180) / Math.PI,
    lon: (newLonRad * 180) / Math.PI,
  }
}
