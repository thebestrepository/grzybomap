import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { ForestStandWithRecommendations, LatLon } from '../types'
import { treeSpeciesName } from '../data/treeSpecies'
import { scoreColor } from '../lib/scoreColor'

function standIcon(percent: number, selected: boolean) {
  const color = scoreColor(percent)
  const size = selected ? 26 : 18
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.5);
      ${selected ? 'outline:2px solid #1f2937;' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#3b82f6;border:3px solid white;
    box-shadow:0 0 0 4px rgba(59,130,246,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function FlyToLocation({ center }: { center: LatLon }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([center.lat, center.lon], map.getZoom(), { duration: 0.8 })
  }, [center.lat, center.lon, map])
  return null
}

function MapClickHandler({ onMapClick }: { onMapClick: (pos: LatLon) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng })
    },
  })
  return null
}

interface MapComponentProps {
  center: LatLon
  radiusKm: number
  stands: ForestStandWithRecommendations[]
  selectedStandId: string | null
  onSelectStand: (id: string) => void
  onMapClick: (pos: LatLon) => void
}

export default function MapComponent({
  center,
  radiusKm,
  stands,
  selectedStandId,
  onSelectStand,
  onMapClick,
}: MapComponentProps) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToLocation center={center} />
      <MapClickHandler onMapClick={onMapClick} />

      <Circle
        center={[center.lat, center.lon]}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#3b82f6', fillOpacity: 0.05, weight: 1 }}
      />
      <Marker position={[center.lat, center.lon]} icon={userIcon}>
        <Popup>Twoja lokalizacja</Popup>
      </Marker>

      {stands.map((stand) => (
        <Marker
          key={stand.id}
          position={[stand.lat, stand.lon]}
          icon={standIcon(stand.best_chance, stand.id === selectedStandId)}
          eventHandlers={{ click: () => onSelectStand(stand.id) }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{treeSpeciesName(stand.dominant_species)}</div>
              <div>Wiek: {stand.age} lat</div>
              <div>Szansa: {stand.best_chance}%</div>
              {stand.recommendations[0] && <div>Top: {stand.recommendations[0].mushroom.pl_name}</div>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${stand.lat},${stand.lon}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-medium text-emerald-700 hover:underline"
              >
                Nawiguj (Google Maps) →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
