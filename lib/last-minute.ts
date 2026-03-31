import { LAST_MINUTE_THRESHOLD_HOURS } from '@/lib/constants'

export function hoursUntilDeparture(departureAt: string): number {
  return (new Date(departureAt).getTime() - Date.now()) / (1000 * 60 * 60)
}

export function isLastMinute(departureAt: string): boolean {
  const hours = hoursUntilDeparture(departureAt)
  return hours > 0 && hours <= LAST_MINUTE_THRESHOLD_HOURS
}

export function getUrgencyLevel(departureAt: string): 'high' | 'medium' | 'low' | null {
  const hours = hoursUntilDeparture(departureAt)
  if (hours <= 0) return null
  if (hours <= 12) return 'high'
  if (hours <= 24) return 'medium'
  if (hours <= LAST_MINUTE_THRESHOLD_HOURS) return 'low'
  return null
}

export function formatCountdown(departureAt: string): { days: number; hours: number; minutes: number } {
  const diff = new Date(departureAt).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
}
