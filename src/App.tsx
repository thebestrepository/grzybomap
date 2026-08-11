import { useEffect, useMemo, useState } from 'react'
import MapComponent from './components/MapComponent'
import LocationPanel from './components/LocationPanel'
import RadiusSlider from './components/RadiusSlider'
import ResultsList from './components/ResultsList'
import StandDetailsModal from './components/StandDetailsModal'
import { generateMockForestStands } from './lib/mockForestStands'
import { fetchForestStandsFromBdl } from './lib/bdlClient'
import { withRecommendations } from './lib/recommendation'
import { getMockWeather } from './lib/mockWeather'
import type { ForestDataSource, ForestStand, LatLon } from './types'

const DEFAULT_LOCATION: LatLon = { lat: 50.2516, lon: 22.5597 }
const DEFAULT_RADIUS_KM = 15
const TOP_RESULTS = 5
const SEARCH_DEBOUNCE_MS = 350

function App() {
  const [location, setLocation] = useState<LatLon>(DEFAULT_LOCATION)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM)
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null)
  const [detailsStandId, setDetailsStandId] = useState<string | null>(null)

  const [rawStands, setRawStands] = useState<ForestStand[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<ForestDataSource>('bdl')
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await fetchForestStandsFromBdl(location.lat, location.lon, radiusKm, {
          signal: controller.signal,
        })
        if (controller.signal.aborted) return

        if (result.anySucceeded) {
          setRawStands(result.stands)
          setDataSource('bdl')
          setFetchError(null)
        } else {
          setRawStands(generateMockForestStands({ centerLat: location.lat, centerLon: location.lon, radiusKm }))
          setDataSource('mock')
          setFetchError('Nie udało się połączyć z Bankiem Danych o Lasach — pokazano dane przykładowe.')
        }
      } catch (err) {
        if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return
        setRawStands(generateMockForestStands({ centerLat: location.lat, centerLon: location.lon, radiusKm }))
        setDataSource('mock')
        setFetchError('Błąd podczas pobierania danych z BDL — pokazano dane przykładowe.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [location, radiusKm])

  const stands = useMemo(
    () => withRecommendations(rawStands).filter((s) => s.best_chance > 0),
    [rawStands],
  )

  const topStands = stands.slice(0, TOP_RESULTS)
  const detailsStand = stands.find((s) => s.id === detailsStandId) ?? null
  const weather = getMockWeather(location.lat, location.lon)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          GrzyboMap 🍄
        </h1>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          {loading && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          )}
          {dataSource === 'bdl' ? 'Dane: Bank Danych o Lasach (BDL)' : 'Dane przykładowe (offline)'}
        </span>
      </header>

      {fetchError && (
        <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          ⚠ {fetchError}
        </div>
      )}

      <main className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[1fr_360px]">
        <div className="h-[50vh] lg:h-[calc(100vh-92px)]">
          <MapComponent
            center={location}
            radiusKm={radiusKm}
            stands={topStands}
            selectedStandId={selectedStandId}
            onSelectStand={setSelectedStandId}
            onMapClick={setLocation}
          />
        </div>

        <aside className="flex flex-col gap-5 overflow-y-auto border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:h-[calc(100vh-92px)]">
          <LocationPanel location={location} onLocationChange={setLocation} />
          <RadiusSlider radiusKm={radiusKm} onChange={setRadiusKm} />
          <hr className="border-gray-200 dark:border-gray-800" />
          {loading && rawStands.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Wyszukiwanie wydzieleń w BDL…</p>
          ) : (
            <ResultsList
              stands={topStands}
              selectedStandId={selectedStandId}
              onSelectStand={setSelectedStandId}
              onOpenDetails={setDetailsStandId}
            />
          )}
        </aside>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-2 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
        © BDL 2026 · Pogoda (dane przykładowe): {weather.temperature_c}°C, wilg. {weather.moisture_percent}%
      </footer>

      {detailsStand && <StandDetailsModal stand={detailsStand} onClose={() => setDetailsStandId(null)} />}
    </div>
  )
}

export default App
