import type { ForestStandWithRecommendations } from '../types'
import { habitatTypeName, PROTECTION_CATEGORY_NAMES, treeSpeciesName } from '../data/treeSpecies'
import { getMockWeather } from '../lib/mockWeather'
import { scoreColor } from '../lib/scoreColor'

const MONTH_NAMES = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
]

function monthLabel(m: string): string {
  const idx = Number.parseInt(m, 10) - 1
  return MONTH_NAMES[idx] ?? m
}

interface StandDetailsModalProps {
  stand: ForestStandWithRecommendations
  onClose: () => void
}

export default function StandDetailsModal({ stand, onClose }: StandDetailsModalProps) {
  const weather = getMockWeather(stand.lat, stand.lon)
  const color = scoreColor(stand.best_chance)

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            🌲 Wydzielenie {stand.forest_address}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold" style={{ color }}>
              🎯 Szanse: {stand.best_chance}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full" style={{ width: `${stand.best_chance}%`, background: color }} />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-sm">
          <dt className="text-gray-500 dark:text-gray-400">📍 Gatunek</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">
            {treeSpeciesName(stand.dominant_species)} ({stand.species_share}%)
          </dd>
          <dt className="text-gray-500 dark:text-gray-400">📏 Wiek</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">{stand.age} lat</dd>
          <dt className="text-gray-500 dark:text-gray-400">📐 Powierzchnia</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">{stand.area_ha} ha</dd>
          <dt className="text-gray-500 dark:text-gray-400">🏠 Siedlisko</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">
            {stand.habitat_type} — {habitatTypeName(stand.habitat_type)}
          </dd>
          <dt className="text-gray-500 dark:text-gray-400">🛡️ Kategoria</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">
            {stand.protection_category ? PROTECTION_CATEGORY_NAMES[stand.protection_category] : 'Brak ograniczeń'}
          </dd>
          <dt className="text-gray-500 dark:text-gray-400">🏢 Nadleśnictwo</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">{stand.nadlesnictwo}</dd>
          <dt className="text-gray-500 dark:text-gray-400">📅 Odległość</dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">{stand.distance_km} km</dd>
        </dl>

        <div className="mt-4">
          <div className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
            🍄 Rekomendowane grzyby
          </div>
          {stand.recommendations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Brak grzybów w sezonie dla tego wydzielenia.</p>
          ) : (
            <ul className="space-y-1.5">
              {stand.recommendations.map((rec) => (
                <li key={rec.mushroom.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-200">
                    {rec.mushroom.edible ? '✓' : '⚠'} {rec.mushroom.pl_name}
                    {rec.mushroom.psychoactive && <span className="ml-1 text-xs text-purple-500">(psychoaktywny)</span>}
                    {!rec.mushroom.edible && !rec.mushroom.psychoactive && (
                      <span className="ml-1 text-xs text-red-500">(niejadalny)</span>
                    )}
                  </span>
                  <span className="font-medium" style={{ color: scoreColor(rec.chance_percent) }}>
                    {rec.chance_percent}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <span>
            📅 Sezon: {stand.recommendations[0] ? monthLabel(stand.recommendations[0].mushroom.season.start) : '—'}
            {' - '}
            {stand.recommendations[0] ? monthLabel(stand.recommendations[0].mushroom.season.end) : ''}
          </span>
          <span>
            💧 {weather.moisture_percent}% · 🌡️ {weather.temperature_c}°C
          </span>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${stand.lat},${stand.lon}&travelmode=driving`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700"
        >
          Nawiguj (Google Maps)
        </a>
      </div>
    </div>
  )
}
