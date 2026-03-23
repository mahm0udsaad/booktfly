'use client'

import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { ROOM_AMENITIES } from '@/lib/constants'
import {
  Wifi, Car, Waves, UtensilsCrossed, Thermometer, Dumbbell,
  CookingPot, WashingMachine, ArrowUpFromDot, ConciergeBell,
  Umbrella, Flame, Star,
} from 'lucide-react'

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  breakfast: UtensilsCrossed,
  ac: Thermometer,
  gym: Dumbbell,
  kitchen: CookingPot,
  laundry: WashingMachine,
  elevator: ArrowUpFromDot,
  room_service: ConciergeBell,
  beach_access: Umbrella,
  bbq: Flame,
  haram_view: Star,
}

type RoomAmenitiesProps = {
  amenities: string[]
  compact?: boolean
  className?: string
}

export function RoomAmenities({ amenities, compact, className }: RoomAmenitiesProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (!amenities || amenities.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {amenities.map((key) => {
        const amenity = ROOM_AMENITIES[key as keyof typeof ROOM_AMENITIES]
        if (!amenity) return null
        const Icon = AMENITY_ICONS[key] || Star
        const label = isAr ? amenity.ar : amenity.en

        if (compact) {
          return (
            <div
              key={key}
              title={label}
              className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          )
        }

        return (
          <div
            key={key}
            className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600"
          >
            <Icon className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
