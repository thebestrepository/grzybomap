export interface GeocodeResult {
  display_name: string
  lat: number
  lon: number
}

export async function searchPlace(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    format: 'json',
    q: query,
    limit: '5',
    countrycodes: 'pl',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
  if (!res.ok) throw new Error('Nie udało się wyszukać miejsca')
  const data: { display_name: string; lat: string; lon: string }[] = await res.json()
  return data.map((d) => ({
    display_name: d.display_name,
    lat: Number.parseFloat(d.lat),
    lon: Number.parseFloat(d.lon),
  }))
}
