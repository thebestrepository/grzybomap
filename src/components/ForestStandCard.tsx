import type { ForestStandWithRecommendations } from '../types'
import { treeSpeciesName } from '../data/treeSpecies'
import { scoreColor } from '../lib/scoreColor'

interface ForestStandCardProps {
  stand: ForestStandWithRecommendations
  rank: number
  selected: boolean
  onSelect: () => void
  onOpenDetails: () => void
}

export default function ForestStandCard({ stand, rank, selected, onSelect, onOpenDetails }: ForestStandCardProps) {
  const color = scoreColor(stand.best_chance)

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border p-3 transition ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-gray-200 bg-white hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">#{rank}</span>
        <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color }}>
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {stand.best_chance}% szans
        </span>
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-full rounded-full" style={{ width: `${stand.best_chance}%`, background: color }} />
      </div>

      <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
        <span className="font-medium">{treeSpeciesName(stand.dominant_species)}</span>, {stand.age} lat
        <span className="ml-2 text-xs text-gray-400">· {stand.distance_km} km</span>
      </div>

      {stand.recommendations.length > 0 && (
        <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
          {stand.recommendations
            .slice(0, 3)
            .map((r) => r.mushroom.pl_name)
            .join(', ')}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenDetails()
        }}
        className="mt-2 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Szczegóły →
      </button>
    </div>
  )
}
