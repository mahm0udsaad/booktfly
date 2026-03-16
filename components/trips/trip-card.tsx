import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Plane, Calendar, Clock, ArrowRight, ArrowLeft, Building2 } from 'lucide-react'
import { cn, formatPrice, formatPriceEN } from '@/lib/utils'
import { TRIP_TYPES, CABIN_CLASSES } from '@/lib/constants'
import { TripStatusBadge } from './trip-status-badge'
import { SeatsIndicator } from './seats-indicator'
import { getCountryCode } from '@/lib/countries'
import type { Trip } from '@/types'

type TripCardProps = {
  trip: Trip
  className?: string
}

export function TripCard({ trip, className }: TripCardProps) {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'

  const originCity = isAr ? trip.origin_city_ar : (trip.origin_city_en || trip.origin_city_ar)
  const destCity = isAr ? trip.destination_city_ar : (trip.destination_city_en || trip.destination_city_ar)
  const tripType = TRIP_TYPES[trip.trip_type]
  const cabinClass = CABIN_CLASSES[trip.cabin_class]
  const formattedPrice = isAr ? formatPrice(trip.price_per_seat, trip.currency) : formatPriceEN(trip.price_per_seat, trip.currency)

  const Arrow = isAr ? ArrowLeft : ArrowRight

  const providerName = trip.provider
    ? isAr
      ? trip.provider.company_name_ar
      : (trip.provider.company_name_en || trip.provider.company_name_ar)
    : null

  const departureDate = new Date(trip.departure_at).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  )

  const departureTime = new Date(trip.departure_at).toLocaleTimeString(
    isAr ? 'ar-SA' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const originCountry = getCountryCode(trip.origin_code, trip.origin_city_en || trip.origin_city_ar)
  const destCountry = getCountryCode(trip.destination_code, trip.destination_city_en || trip.destination_city_ar)

  return (
    <Link href={`/${locale}/trips/${trip.id}`} className="block group h-full focus:outline-none">
      <div
        className={cn(
          'relative h-full flex flex-col rounded-[2rem] border border-slate-200 bg-white overflow-hidden transition-all duration-300',
          'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1',
          className
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors duration-300">
                <Plane className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-none">{trip.airline}</span>
                <span className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">
                  {isAr ? cabinClass.ar : cabinClass.en} {trip.flight_number && `• ${trip.flight_number}`}
                </span>
              </div>
            </div>
            <TripStatusBadge status={trip.status} />
          </div>

          {/* Route Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{originCity}</span>
              <div className="flex items-center gap-1.5 mt-1">
                {originCountry && (
                  <img src={`https://flagcdn.com/w20/${originCountry}.png`} alt={originCountry} className="h-3 w-4 rounded-sm object-cover shadow-sm" />
                )}
                <span className="text-xs font-bold text-slate-400">{trip.origin_code}</span>
              </div>
            </div>
            
            {/* Visual flight path */}
            <div className="flex flex-col items-center justify-center px-2 md:px-4 w-[100px] shrink-0">
               <div className="flex items-center w-full gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="h-[2px] flex-1 bg-slate-200 rounded-full" />
                  <Plane className="h-3.5 w-3.5 text-primary rtl:rotate-180 shrink-0" />
                  <div className="h-[2px] flex-1 bg-slate-200 rounded-full" />
               </div>
               <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 mt-1.5 whitespace-nowrap">
                  {isAr ? tripType.ar : tripType.en}
               </span>
            </div>

            <div className="flex flex-col flex-1 text-end min-w-0 items-end">
              <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate w-full">{destCity}</span>
              <div className="flex items-center gap-1.5 mt-1">
                {destCountry && (
                  <img src={`https://flagcdn.com/w20/${destCountry}.png`} alt={destCountry} className="h-3 w-4 rounded-sm object-cover shadow-sm" />
                )}
                <span className="text-xs font-bold text-slate-400">{trip.destination_code}</span>
              </div>
            </div>
          </div>

          {/* Meta Information Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
             <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold">{departureDate}</span>
             </div>
             <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold">{departureTime}</span>
             </div>
             {providerName && (
               <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-600 ml-auto rtl:ml-0 rtl:mr-auto min-w-0 max-w-[40%]">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold truncate">{providerName}</span>
               </div>
             )}
          </div>

          <div className="mt-auto">
             {/* Seats indicator */}
             <div className="mb-5">
               <SeatsIndicator
                  totalSeats={trip.total_seats}
                  bookedSeats={trip.booked_seats}
                  compact
                  className="h-1.5"
                />
             </div>

             {/* Footer Price & CTA */}
             <div className="flex items-end justify-between pt-5 border-t border-slate-100">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('common.per_seat')}</span>
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