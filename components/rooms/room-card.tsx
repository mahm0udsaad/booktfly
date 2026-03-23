import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { BedDouble, MapPin, Users, ArrowRight, ArrowLeft, Building2 } from 'lucide-react'
import { cn, formatPrice, formatPriceEN } from '@/lib/utils'
import { ROOM_CATEGORIES } from '@/lib/constants'
import { RoomStatusBadge } from './room-status-badge'
import { RoomAmenities } from './room-amenities'
import { RoomAvailabilityBadge } from './room-availability-badge'
import type { Room } from '@/types'

type RoomCardProps = {
  room: Room
  className?: string
}

export function RoomCard({ room, className }: RoomCardProps) {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'

  const name = isAr ? room.name_ar : (room.name_en || room.name_ar)
  const city = isAr ? room.city_ar : (room.city_en || room.city_ar)
  const categoryLabel = ROOM_CATEGORIES[room.category as keyof typeof ROOM_CATEGORIES]
  const categoryText = categoryLabel ? (isAr ? categoryLabel.ar : categoryLabel.en) : room.category
  const formattedPrice = isAr ? formatPrice(room.price_per_night, room.currency) : formatPriceEN(room.price_per_night, room.currency)

  const Arrow = isAr ? ArrowLeft : ArrowRight

  const providerName = room.provider
    ? isAr
      ? room.provider.company_name_ar
      : (room.provider.company_name_en || room.provider.company_name_ar)
    : null

  const firstImage = room.images?.[0]

  return (
    <Link href={`/${locale}/rooms/${room.id}`} className="block group h-full focus:outline-none">
      <div
        className={cn(
          'relative h-full flex flex-col rounded-[2rem] border border-slate-200 bg-white overflow-hidden transition-all duration-300',
          'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1',
          className
        )}
      >
        {/* Image */}
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BedDouble className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            <RoomStatusBadge status={room.status} />
          </div>
          <div className="absolute top-3 end-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm text-slate-700 border border-white/50 shadow-sm">
              {categoryText}
            </span>
          </div>
        </div>

        <div className="flex flex-col h-full p-6">
          {/* Name & City */}
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-500">{city}</span>
            </div>
          </div>

          {/* Meta Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold">{room.max_capacity} {t('rooms.guests')}</span>
            </div>
            <RoomAvailabilityBadge
              instantBook={room.instant_book}
              availableFrom={room.available_from}
              availableTo={room.available_to}
            />
            {providerName && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600 ml-auto rtl:ml-0 rtl:mr-auto min-w-0 max-w-[40%]">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold truncate">{providerName}</span>
              </div>
            )}
          </div>

          {/* Amenities (compact) */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="mb-4">
              <RoomAmenities amenities={room.amenities.slice(0, 6)} compact />
            </div>
          )}

          <div className="mt-auto">
            {/* Footer Price & CTA */}
            <div className="flex items-end justify-between pt-5 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('rooms.per_night')}</span>
                <span className="text-2xl font-black text-slate-900 leading-none">{formattedPrice}</span>
              </div>

              <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 shrink-0">
                <Arrow className="h-4 w-4 rtl:rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
