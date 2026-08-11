/** Canonical species codes used to author the mushroom database. Real BDL data is
 * normalized to these (compound codes like "DB.S" / "SO.C" are stripped to their base). */
export type TreeSpeciesCode =
  | 'SO' // Sosna zwyczajna
  | 'ŚW' // Świerk pospolity
  | 'JD' // Jodła pospolita
  | 'MD' // Modrzew europejski
  | 'DG' // Daglezja zielona
  | 'BK' // Buk zwyczajny
  | 'DB' // Dąb (szypułkowy/bezszypułkowy/czerwony)
  | 'GB' // Grab pospolity
  | 'BRZ' // Brzoza (brodawkowata/omszona)
  | 'OL' // Olsza (czarna/szara)
  | 'OS' // Osika
  | 'TP' // Topola
  | 'WZ' // Wiąz
  | 'JS' // Jesion wyniosły
  | 'JW' // Jawor
  | 'KL' // Klon pospolity
  | 'LP' // Lipa drobnolistna
  | 'AK' // Robinia akacjowa

/** Canonical siedliskowy typ lasu (habitat) codes used to author the mushroom database. */
export type HabitatType =
  | 'BŚW' | 'BW' | 'BB' | 'BMŚW' | 'BMW' | 'BMB' | 'BMWYŻ'
  | 'LŚW' | 'LW' | 'LMŚW' | 'LMW' | 'LMB' | 'LMWYŻ' | 'LGŚW' | 'LMGŚW'
  | 'LŁ' | 'LŁWYŻ' | 'LWYŻŚ' | 'LWYŻW'
  | 'OL' | 'OLJ' | 'OLJWYŻ'

export type ProtectionCategory = 'natura2000' | 'rezerwat' | 'las_ochronny' | null

export interface Mushroom {
  id: string
  pl_name: string
  en_name: string
  scientific_name: string
  habitat_trees: TreeSpeciesCode[]
  preferred_age: [number, number]
  soil_types: HabitatType[]
  season: { start: string; end: string }
  min_moisture: number
  difficulty: 'easy' | 'medium' | 'hard'
  edible: boolean
  psychoactive?: boolean
}

export interface ForestStand {
  id: string
  forest_address: string
  nadlesnictwo: string
  lat: number
  lon: number
  /** Normalized species code — usually a TreeSpeciesCode, but real BDL data can contain
   * codes outside our curated list; those simply won't match any mushroom's habitat_trees. */
  dominant_species: string
  species_share: number
  age: number
  area_ha: number
  /** Real BDL site_type code — see HabitatType for the curated subset the mushroom DB uses. */
  habitat_type: string
  protection_category: ProtectionCategory
  data_year: number
  distance_km: number
}

export interface MushroomRecommendation {
  mushroom: Mushroom
  chance_percent: number
  season_active: boolean
}

export interface ForestStandWithRecommendations extends ForestStand {
  recommendations: MushroomRecommendation[]
  best_chance: number
}

export interface WeatherConditions {
  temperature_c: number
  moisture_percent: number
}

export interface LatLon {
  lat: number
  lon: number
}

export type ForestDataSource = 'bdl' | 'mock'
