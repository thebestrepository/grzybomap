import { MUSHROOMS } from '../data/mushrooms'
import type {
  ForestStand,
  ForestStandWithRecommendations,
  Mushroom,
  MushroomRecommendation,
  WeatherConditions,
} from '../types'
import { getMockWeather } from './mockWeather'

function isSeasonActive(mushroom: Mushroom, referenceDate: Date): boolean {
  const month = referenceDate.getMonth() + 1
  const start = Number.parseInt(mushroom.season.start, 10)
  const end = Number.parseInt(mushroom.season.end, 10)
  return start <= month && month <= end
}

function weatherConditionsOptimal(mushroom: Mushroom, weather: WeatherConditions): boolean {
  return weather.moisture_percent >= mushroom.min_moisture
}

/**
 * Ports the scoring algorithm from the GrzyboMap spec (Python) to TypeScript.
 * score = base + tree_match_bonus + age_bonus - protection_penalty
 *         + habitat_bonus + season_bonus + weather_bonus
 */
export function calculateMushroomChance(
  standInput: ForestStand,
  mushroom: Mushroom,
  weather: WeatherConditions,
  referenceDate: Date = new Date(),
): number {
  let score = 0

  // 1. Tree match (40 punktów) — dominant_species is a raw/normalized code from the data
  // source (BDL or mock), which may fall outside our curated TreeSpeciesCode list.
  if ((mushroom.habitat_trees as string[]).includes(standInput.dominant_species)) {
    if (standInput.species_share >= 70) score += 40
    else if (standInput.species_share >= 40) score += 25
    else score += 10
  } else {
    return 0 // Grzyb nie występuje przy tym gatunku drzewa
  }

  // 2. Age bonus (20 punktów)
  const [minAge, maxAge] = mushroom.preferred_age
  if (minAge <= standInput.age && standInput.age <= maxAge) {
    score += 20
  } else {
    score -= 5
  }

  // 3. Habitat type (15 punktów)
  if ((mushroom.soil_types as string[]).includes(standInput.habitat_type)) {
    score += 15
  }

  // 4. Season check (10 punktów) — poza sezonem brak szans
  if (isSeasonActive(mushroom, referenceDate)) {
    score += 10
  } else {
    return 0
  }

  // 5. Weather impact (15 punktów)
  if (weatherConditionsOptimal(mushroom, weather)) {
    score += 15
  }

  // 6. Protection penalty
  if (standInput.protection_category === 'natura2000' || standInput.protection_category === 'rezerwat') {
    score -= 30
  } else if (standInput.protection_category === 'las_ochronny') {
    score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

export function getRecommendationsForStand(
  stand: ForestStand,
  referenceDate: Date = new Date(),
): MushroomRecommendation[] {
  const weather = getMockWeather(stand.lat, stand.lon)

  return MUSHROOMS.map((mushroom) => ({
    mushroom,
    chance_percent: calculateMushroomChance(stand, mushroom, weather, referenceDate),
    season_active: isSeasonActive(mushroom, referenceDate),
  }))
    .filter((rec) => rec.chance_percent > 0)
    .sort((a, b) => b.chance_percent - a.chance_percent)
}

export function withRecommendations(
  stands: ForestStand[],
  referenceDate: Date = new Date(),
): ForestStandWithRecommendations[] {
  return stands
    .map((stand) => {
      const recommendations = getRecommendationsForStand(stand, referenceDate)
      return {
        ...stand,
        recommendations,
        best_chance: recommendations[0]?.chance_percent ?? 0,
      }
    })
    .sort((a, b) => b.best_chance - a.best_chance)
}
