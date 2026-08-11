import type { ForestStandWithRecommendations } from '../types'
import ForestStandCard from './ForestStandCard'

interface ResultsListProps {
  stands: ForestStandWithRecommendations[]
  selectedStandId: string | null
  onSelectStand: (id: string) => void
  onOpenDetails: (id: string) => void
}

export default function ResultsList({ stands, selectedStandId, onSelectStand, onOpenDetails }: ResultsListProps) {
  if (stands.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Brak wydzieleń z szansą na grzyby w tym promieniu i sezonie. Spróbuj zwiększyć promień.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        TOP {stands.length} WYNIKÓW
      </div>
      {stands.map((stand, i) => (
        <ForestStandCard
          key={stand.id}
          stand={stand}
          rank={i + 1}
          selected={stand.id === selectedStandId}
          onSelect={() => onSelectStand(stand.id)}
          onOpenDetails={() => onOpenDetails(stand.id)}
        />
      ))}
    </div>
  )
}
