export function scoreColor(percent: number): string {
  if (percent >= 70) return '#22c55e' // green
  if (percent >= 40) return '#eab308' // yellow
  return '#ef4444' // red
}

export function scoreLabel(percent: number): string {
  if (percent >= 70) return 'Duże szanse'
  if (percent >= 40) return 'Średnie szanse'
  return 'Małe szanse'
}
