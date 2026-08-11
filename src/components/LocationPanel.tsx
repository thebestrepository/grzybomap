import { useState } from 'react'
import type { LatLon } from '../types'
import { searchPlace, type GeocodeResult } from '../lib/geocode'

interface LocationPanelProps {
  location: LatLon
  onLocationChange: (loc: LatLon) => void
}

export default function LocationPanel({ location, onLocationChange }: LocationPanelProps) {
  const [latInput, setLatInput] = useState(location.lat.toFixed(4))
  const [lonInput, setLonInput] = useState(location.lon.toFixed(4))
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  function applyCoords() {
    const lat = Number.parseFloat(latInput)
    const lon = Number.parseFloat(lonInput)
    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Nieprawidłowe współrzędne')
      return
    }
    setError(null)
    onLocationChange({ lat, lon })
  }

  async function handleSearch() {
    setSearching(true)
    setError(null)
    try {
      const found = await searchPlace(query)
      setResults(found)
      if (found.length === 0) setError('Brak wyników')
    } catch {
      setError('Błąd wyszukiwania miejsca')
    } finally {
      setSearching(false)
    }
  }

  function handleUseGps() {
    if (!navigator.geolocation) {
      setError('Geolokalizacja niedostępna w tej przeglądarce')
      return
    }
    setGpsLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        setLatInput(loc.lat.toFixed(4))
        setLonInput(loc.lon.toFixed(4))
        onLocationChange(loc)
        setGpsLoading(false)
      },
      () => {
        setError('Nie udało się pobrać lokalizacji GPS')
        setGpsLoading(false)
      },
    )
  }

  function selectResult(result: GeocodeResult) {
    setLatInput(result.lat.toFixed(4))
    setLonInput(result.lon.toFixed(4))
    setResults([])
    setQuery(result.display_name)
    onLocationChange({ lat: result.lat, lon: result.lon })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          🔍 Wyszukaj miejsce
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="np. Lublin, Kraków..."
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {searching ? '...' : 'Szukaj'}
          </button>
        </div>
        {results.length > 0 && (
          <ul className="mt-1 max-h-40 overflow-auto rounded-md border border-gray-200 text-sm dark:border-gray-700">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lon}`}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="block w-full truncate px-2 py-1.5 text-left hover:bg-emerald-50 dark:hover:bg-gray-700"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseGps}
        disabled={gpsLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-gray-800"
      >
        📍 {gpsLoading ? 'Pobieranie lokalizacji...' : 'Użyj mojej lokacji'}
      </button>

      <div>
        <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">📍 Koordynaty</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            placeholder="Szerokość"
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
          <input
            type="text"
            value={lonInput}
            onChange={(e) => setLonInput(e.target.value)}
            placeholder="Długość"
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <button
          type="button"
          onClick={applyCoords}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Ustaw współrzędne
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
