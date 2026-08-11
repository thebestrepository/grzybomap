import type { ForestStand, ProtectionCategory } from '../types'
import { boundingBoxForRadius, haversineDistanceKm } from './geo'

const BASE_URL = 'https://ogcapi.bdl.lasy.gov.pl'
const REQUEST_TIMEOUT_MS = 10000

interface RdlpCollection {
  id: string
  label: string
  centroid: { lat: number; lon: number }
}

/** OGC API Features collection IDs for the "wydzielenia" (forest stand) layer of each RDLP,
 * confirmed against https://ogcapi.bdl.lasy.gov.pl/collections?f=json. Centroids are the RDLP
 * headquarters city — a rough proxy used only to pick which collections to query first, since
 * RDLP administrative borders don't follow simple geography (nadleśnictwa can have exclaves). */
const RDLP_COLLECTIONS: RdlpCollection[] = [
  { id: 'RDLP_Bialystok_wydzielenia', label: 'RDLP Białystok', centroid: { lat: 53.1325, lon: 23.1688 } },
  { id: 'RDLP_Gdansk_wydzielenia', label: 'RDLP Gdańsk', centroid: { lat: 54.352, lon: 18.6466 } },
  { id: 'RDLP_Katowice_wydzielenia', label: 'RDLP Katowice', centroid: { lat: 50.2649, lon: 19.0238 } },
  { id: 'RDLP_Krakow_wydzielenia', label: 'RDLP Kraków', centroid: { lat: 50.0647, lon: 19.945 } },
  { id: 'RDLP_Krosno_wydzielenia', label: 'RDLP Krosno', centroid: { lat: 49.6884, lon: 21.771 } },
  { id: 'RDLP_Lodz_wydzielenia', label: 'RDLP Łódź', centroid: { lat: 51.7592, lon: 19.456 } },
  { id: 'RDLP_Lublin_wydzielenia', label: 'RDLP Lublin', centroid: { lat: 51.2465, lon: 22.5684 } },
  { id: 'RDLP_Olsztyn_wydzielenia', label: 'RDLP Olsztyn', centroid: { lat: 53.7784, lon: 20.4801 } },
  { id: 'RDLP_Pila_wydzielenia', label: 'RDLP Piła', centroid: { lat: 53.1517, lon: 16.7382 } },
  { id: 'RDLP_Poznan_wydzielenia', label: 'RDLP Poznań', centroid: { lat: 52.4064, lon: 16.9252 } },
  { id: 'RDLP_Radom_wydzielenia', label: 'RDLP Radom', centroid: { lat: 51.4027, lon: 21.1471 } },
  { id: 'RDLP_Szczecin_wydzielenia', label: 'RDLP Szczecin', centroid: { lat: 53.4285, lon: 14.5528 } },
  { id: 'RDLP_Szczecinek_wydzielenia', label: 'RDLP Szczecinek', centroid: { lat: 53.7074, lon: 16.6985 } },
  { id: 'RDLP_Torun_wydzielenia', label: 'RDLP Toruń', centroid: { lat: 53.0138, lon: 18.5984 } },
  { id: 'RDLP_Warszawa_wydzielenia', label: 'RDLP Warszawa', centroid: { lat: 52.2297, lon: 21.0122 } },
  { id: 'RDLP_Wroclaw_wydzielenia', label: 'RDLP Wrocław', centroid: { lat: 51.1079, lon: 17.0385 } },
  { id: 'RDLP_Zielona_Gora_wydzielenia', label: 'RDLP Zielona Góra', centroid: { lat: 51.9356, lon: 15.5062 } },
]

interface BdlFeatureProperties {
  a_i_num: number
  adr_for: string | null
  area_type: string | null
  site_type: string | null
  forest_fun: string | null
  sub_area: number | null
  prot_categ: string | null
  species_cd: string | null
  part_cd: string | null
  spec_age: number | null
  a_year: number | null
  nazwa: string | null
}

interface BdlGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][] | number[][][][]
}

interface BdlFeature {
  type: 'Feature'
  geometry: BdlGeometry | null
  properties: BdlFeatureProperties
}

interface BdlFeatureCollection {
  type: 'FeatureCollection'
  features: BdlFeature[]
}

function nearestCollections(lat: number, lon: number, count: number): RdlpCollection[] {
  return [...RDLP_COLLECTIONS]
    .sort(
      (a, b) =>
        haversineDistanceKm(lat, lon, a.centroid.lat, a.centroid.lon) -
        haversineDistanceKm(lat, lon, b.centroid.lat, b.centroid.lon),
    )
    .slice(0, count)
}

/** Real species_cd values include variants like "DB.S" (dąb szypułkowy) / "SO.C" (sosna
 * czarna) — strip to the base genus code used by the mushroom database. */
function normalizeSpeciesCode(code: string): string {
  return code.split('.')[0]
}

function mapProtectionCategory(forestFun: string | null, protCateg: string | null): ProtectionCategory {
  if (forestFun === 'REZ' || forestFun === 'REZ CZ') return 'rezerwat'
  if (protCateg) return 'las_ochronny'
  return null
}

/** Average of the outer-ring vertices — a good-enough marker position, not a true area centroid. */
function geometryCentroid(geometry: BdlGeometry): { lat: number; lon: number } | null {
  const ring =
    geometry.type === 'Polygon'
      ? (geometry.coordinates as number[][][])[0]
      : (geometry.coordinates as number[][][][])[0]?.[0]
  if (!ring || ring.length === 0) return null

  let sumLon = 0
  let sumLat = 0
  for (const [lon, lat] of ring) {
    sumLon += lon
    sumLat += lat
  }
  return { lat: sumLat / ring.length, lon: sumLon / ring.length }
}

/** "nazwa" looks like "BDL_05_02_BILGORAJ_2026" — pull out the nadleśnictwo name. */
function extractNadlesnictwo(nazwa: string | null): string {
  if (!nazwa) return ''
  const parts = nazwa.split('_').slice(3, -1)
  if (parts.length === 0) return nazwa
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())
}

function featureToForestStand(
  feature: BdlFeature,
  searchCenter: { lat: number; lon: number },
): ForestStand | null {
  const p = feature.properties
  if (!p.species_cd || p.area_type !== 'D-STAN' || !feature.geometry) return null

  const centroid = geometryCentroid(feature.geometry)
  if (!centroid) return null

  const sharePercent = p.part_cd ? Number.parseInt(p.part_cd, 10) * 10 : 50

  return {
    id: `bdl_${p.a_i_num}`,
    forest_address: (p.adr_for ?? '').trim(),
    nadlesnictwo: extractNadlesnictwo(p.nazwa),
    lat: centroid.lat,
    lon: centroid.lon,
    dominant_species: normalizeSpeciesCode(p.species_cd),
    species_share: Math.max(0, Math.min(100, sharePercent)),
    age: p.spec_age ?? 0,
    area_ha: p.sub_area ?? 0,
    habitat_type: p.site_type ?? '',
    protection_category: mapProtectionCategory(p.forest_fun, p.prot_categ),
    data_year: p.a_year ?? new Date().getFullYear(),
    distance_km:
      Math.round(haversineDistanceKm(searchCenter.lat, searchCenter.lon, centroid.lat, centroid.lon) * 10) / 10,
  }
}

async function fetchCollectionStands(
  collection: RdlpCollection,
  bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number },
  limit: number,
  searchCenter: { lat: number; lon: number },
  outerSignal: AbortSignal | undefined,
): Promise<ForestStand[]> {
  const params = new URLSearchParams({
    bbox: `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
    area_type: 'D-STAN',
    limit: String(limit),
    f: 'json',
  })
  const url = `${BASE_URL}/collections/${collection.id}/items?${params}`

  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)
  const onOuterAbort = () => timeoutController.abort()
  outerSignal?.addEventListener('abort', onOuterAbort)

  try {
    const res = await fetch(url, { signal: timeoutController.signal })
    if (!res.ok) throw new Error(`BDL ${collection.id}: HTTP ${res.status}`)
    const data: BdlFeatureCollection = await res.json()
    return data.features
      .map((f) => featureToForestStand(f, searchCenter))
      .filter((s): s is ForestStand => s !== null)
  } finally {
    clearTimeout(timeoutId)
    outerSignal?.removeEventListener('abort', onOuterAbort)
  }
}

export interface BdlSearchResult {
  stands: ForestStand[]
  /** True if at least one RDLP collection responded successfully (even with 0 matches) —
   * distinguishes "genuinely no forest here" from "couldn't reach BDL at all". */
  anySucceeded: boolean
}

export async function fetchForestStandsFromBdl(
  lat: number,
  lon: number,
  radiusKm: number,
  options: { candidateCount?: number; limitPerCollection?: number; signal?: AbortSignal } = {},
): Promise<BdlSearchResult> {
  const { candidateCount = 3, limitPerCollection = 400, signal } = options
  const bbox = boundingBoxForRadius(lat, lon, radiusKm)
  const candidates = nearestCollections(lat, lon, candidateCount)
  const searchCenter = { lat, lon }

  const settled = await Promise.allSettled(
    candidates.map((c) => fetchCollectionStands(c, bbox, limitPerCollection, searchCenter, signal)),
  )

  let anySucceeded = false
  const allStands: ForestStand[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      anySucceeded = true
      allStands.push(...result.value)
    }
  }

  const seen = new Set<string>()
  const deduped = allStands.filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })

  return { stands: deduped.filter((s) => s.distance_km <= radiusKm), anySucceeded }
}
