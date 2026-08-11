import type { WeatherConditions } from '../types'
import { createSeededRandom, seedFromCoords } from './geo'

/** Deterministic pseudo-weather for a location, since Faza 1 mocks the weather API. */
export function getMockWeather(lat: number, lon: number): WeatherConditions {
  const rng = createSeededRandom(seedFromCoords(lat, lon) ^ 0x57e4)
  return {
    temperature_c: Math.round(8 + rng() * 20),
    moisture_percent: Math.round(40 + rng() * 50),
  }
}
