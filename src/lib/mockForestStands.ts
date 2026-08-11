import type { ForestStand, HabitatType, ProtectionCategory, TreeSpeciesCode } from '../types'
import { createSeededRandom, haversineDistanceKm, randomPointInRadius, seedFromCoords } from './geo'

/** Species weighted roughly like real Polish forest composition (pine-dominant). */
const SPECIES_WEIGHTS: [TreeSpeciesCode, number][] = [
  ['SO', 34],
  ['ŚW', 12],
  ['BRZ', 11],
  ['DB', 10],
  ['BK', 8],
  ['MD', 5],
  ['GB', 4],
  ['JD', 4],
  ['OS', 3],
  ['JS', 2],
  ['OL', 2],
  ['WZ', 1],
  ['LP', 1],
  ['KL', 1],
  ['TP', 1],
  ['DG', 1],
]

const HABITAT_TYPES: HabitatType[] = ['BŚW', 'BMŚW', 'LMŚW', 'LŚW', 'BMW', 'LMW', 'OL']

const NADLESNICTWA = [
  'Janów',
  'Kraśnik',
  'Biłgoraj',
  'Zwierzyniec',
  'Chełm',
  'Krasnystaw',
  'Świdnik',
  'Lubartów',
]

function weightedPick<T>(weights: [T, number][], rng: () => number): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  let r = rng() * total
  for (const [value, w] of weights) {
    r -= w
    if (r <= 0) return value
  }
  return weights[weights.length - 1][0]
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function protectionCategoryFor(rng: () => number): ProtectionCategory {
  const r = rng()
  if (r < 0.06) return 'natura2000'
  if (r < 0.09) return 'rezerwat'
  if (r < 0.18) return 'las_ochronny'
  return null
}

function forestAddressFor(rng: () => number): string {
  const part = () => Math.floor(rng() * 20) + 1
  return `05-${part()}-${part()}-${part()}-${100 + Math.floor(rng() * 200)}`
}

export interface GenerateOptions {
  centerLat: number
  centerLon: number
  radiusKm: number
  count?: number
}

export function generateMockForestStands({
  centerLat,
  centerLon,
  radiusKm,
  count,
}: GenerateOptions): ForestStand[] {
  const seed = seedFromCoords(centerLat, centerLon) ^ Math.round(radiusKm * 1000)
  const rng = createSeededRandom(seed)
  const standCount = count ?? Math.min(60, Math.max(12, Math.round(radiusKm * 2.5)))

  const stands: ForestStand[] = []
  for (let i = 0; i < standCount; i++) {
    const { lat, lon } = randomPointInRadius(centerLat, centerLon, radiusKm, rng)
    const dominant_species = weightedPick(SPECIES_WEIGHTS, rng)
    const distance_km = haversineDistanceKm(centerLat, centerLon, lat, lon)

    stands.push({
      id: `bdl_mock_${i}_${Math.round(lat * 10000)}_${Math.round(lon * 10000)}`,
      forest_address: forestAddressFor(rng),
      nadlesnictwo: pick(NADLESNICTWA, rng),
      lat,
      lon,
      dominant_species,
      species_share: 40 + Math.floor(rng() * 60),
      age: 5 + Math.floor(rng() * 140),
      area_ha: Math.round((1 + rng() * 25) * 100) / 100,
      habitat_type: pick(HABITAT_TYPES, rng),
      protection_category: protectionCategoryFor(rng),
      data_year: 2026,
      distance_km: Math.round(distance_km * 10) / 10,
    })
  }

  return stands.sort((a, b) => a.distance_km - b.distance_km)
}
