interface RadiusSliderProps {
  radiusKm: number
  onChange: (radiusKm: number) => void
}

export default function RadiusSlider({ radiusKm, onChange }: RadiusSliderProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>⭕ Promień wyszukiwania</span>
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{radiusKm} km</span>
      </div>
      <input
        type="range"
        min={1}
        max={50}
        step={1}
        value={radiusKm}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>1 km</span>
        <span>50 km</span>
      </div>
    </div>
  )
}
