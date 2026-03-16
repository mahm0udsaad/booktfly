'use client'

import { useEffect, useState, use } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plane,
  Calendar,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Shield,
  Minus,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn, formatPrice, formatPriceEN, shortId } from '@/lib/utils'
import { TRIP_TYPES, CABIN_CLASSES, MAX_SEATS_PER_BOOKING } from '@/lib/constants'
import { TripStatusBadge } from '@/components/trips/trip-status-badge'
import { SeatsIndicator } from '@/components/trips/seats-indicator'
import { DetailPageSkeleton } from '@/components/shared/loading-skeleton'
import { getCountryCode } from '@/lib/countries'
import type { Trip } from '@/types'

export default function TripDetailClient({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()
  // React 19 expects params to be awaited
  const { id: tripId } = use(params)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [seatsCount, setSeatsCount] = useState(1)

  const Arrow = isAr ? ArrowLeft : ArrowRight
  const Back = isAr ? ChevronRight : ChevronLeft

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`)
        const data = await res.json()
        if (data.trip) {
          setTrip(data.trip)
        }
      } catch {
        // Error handled
      } finally {
        setLoading(false)
      }
    }
    fetchTrip()
  }, [tripId])

  if (loading) return <DetailPageSkeleton />

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-6">
            <AlertTriangle className="h-10 w-10 text-warning" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">{t('errors.not_found')}</h2>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
        >
          <Back className="h-4 w-4" />
          {t('common.back')}
        </button>
      </div>
    )
  }

  const originCity = isAr ? trip.origin_city_ar : (trip.origin_city_en || trip.origin_city_ar)
  const destCity = isAr ? trip.destination_city_ar : (trip.destination_city_en || trip.destination_city_ar)
  const remaining = trip.total_seats - trip.booked_seats
  const maxBookable = Math.min(remaining, MAX_SEATS_PER_BOOKING)
  const totalPrice = trip.price_per_seat * seatsCount
  const fmt = (amount: number) => isAr ? formatPrice(amount, trip.currency) : formatPriceEN(amount, trip.currency)

  const isBookable = trip.status === 'active' && remaining > 0
  const isNotAvailable = trip.status === 'expired' || trip.status === 'removed'
  const isSoldOut = trip.status === 'sold_out' || remaining <= 0

  const departureDate = new Date(trip.departure_at).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )
  const departureTime = new Date(trip.departure_at).toLocaleTimeString(
    isAr ? 'ar-SA' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const returnDate = trip.return_at
    ? new Date(trip.return_at).toLocaleDateString(
        isAr ? 'ar-SA' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null

  const tripDesc = isAr
    ? trip.description_ar
    : (trip.description_en || trip.description_ar)

  const originCountry = getCountryCode(trip.origin_code, trip.origin_city_en || trip.origin_city_ar)
  const destCountry = getCountryCode(trip.destination_code, trip.destination_city_en || trip.destination_city_ar)

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 lg:pt-36 lg:pb-12 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 md:mb-8 transition-colors"
      >
        <div className="p-1.5 md:p-2 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <Back className="h-3 w-3 md:h-4 md:w-4 rtl:rotate-180" />
        </div>
        {t('common.back')}
      </button>

      {/* Not available banner */}
      {isNotAvailable && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 md:p-5 mb-6 md:mb-8 flex items-center gap-3 md:gap-4 shadow-sm animate-fade-in-up">
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive shrink-0" />
          <p className="text-sm md:text-base font-bold text-destructive">
            {t('trips.not_available')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Main content - The Ticket */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">
          
          <div className="rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
            {/* Ticket Top Decorative Edge */}
            <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-primary to-accent" />
            
            <div className="p-6 md:p-10">
                {/* Header card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner shrink-0">
                        <Plane className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wide">{trip.airline}</h2>
                        {trip.flight_number && (
                            <p className="text-xs md:text-sm font-semibold text-slate-500 tracking-wider">
                            {t('trips.flight_number')}: <span className="text-slate-700">{trip.flight_number}</span>
                            </p>
                        )}
                        </div>
                    </div>
                    <div className="self-start sm:self-auto">
                        <TripStatusBadge status={trip.status} />
                    </div>
                </div>

                {/* Route - Massive and Clear */}
                <div className="flex items-center gap-2 md:gap-4 py-8 md:py-10 border-y border-slate-100 border-dashed relative">
                    {/* Fake ticket cutouts */}
                    <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200 border-l-transparent" />
                    <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200 border-r-transparent" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent shrink-0" />
                        <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest truncate">{t('common.from')}</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight truncate">{originCity}</p>
                        <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                            {originCountry && (
                              <img src={`https://flagcdn.com/w40/${originCountry}.png`} alt={originCountry} className="h-4 w-6 md:h-5 md:w-7 rounded-sm object-cover shadow-sm" />
                            )}
                            {trip.origin_code && (
                            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg bg-slate-100 text-slate-600 text-xs md:text-sm font-black uppercase tracking-widest">{trip.origin_code}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-2 md:px-4 shrink-0">
                        <Arrow className="h-6 w-6 md:h-8 md:w-8 text-slate-300 rtl:rotate-180 mb-1 md:mb-2" />
                        <div className="hidden sm:block h-px w-12 md:w-16 bg-slate-200 border border-slate-200 border-dashed" />
                    </div>

                    <div className="flex-1 text-end min-w-0 items-end flex flex-col">
                        <div className="flex items-center justify-end gap-1.5 md:gap-2 mb-1 md:mb-2 w-full">
                        <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest truncate">{t('common.to')}</span>
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent shrink-0" />
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight truncate w-full">{destCity}</p>
                        <div className="flex items-center justify-end gap-2 mt-1.5 md:mt-2 w-full">
                             {trip.destination_code && (
                            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg bg-slate-100 text-slate-600 text-xs md:text-sm font-black uppercase tracking-widest">{trip.destination_code}</span>
                            )}
                            {destCountry && (
                              <img src={`https://flagcdn.com/w40/${destCountry}.png`} alt={destCountry} className="h-4 w-6 md:h-5 md:w-7 rounded-sm object-cover shadow-sm" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8 md:pt-10">
                    <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-slate-400">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{t('trips.departure')}</span>
                        </div>
                        <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">{departureDate}</p>
                        <p className="text-xs md:text-sm font-semibold text-accent mt-0.5 md:mt-1">{departureTime}</p>
                    </div>
                    
                    {returnDate ? (
                        <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-slate-400">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{t('trips.return_date')}</span>
                            </div>
                            <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">{returnDate}</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100 flex flex-col justify-center opacity-70">
                             <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-slate-400">
                                <Clock className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{t('trips.trip_type')}</span>
                            </div>
                            <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                                {isAr ? TRIP_TYPES[trip.trip_type].ar : TRIP_TYPES[trip.trip_type].en}
                            </p>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-slate-400">
                        <Users className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{t('trips.cabin_class')}</span>
                        </div>
                        <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                        {isAr ? CABIN_CLASSES[trip.cabin_class].ar : CABIN_CLASSES[trip.cabin_class].en}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 text-slate-400">
                           <Shield className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                           <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{t('trips.total_seats')}</span>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{trip.total_seats}</p>
                    </div>
                </div>
            </div>
            
            {/* Seats Bar */}
            <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3 md:mb-4">{t('trips.availability')}</h3>
                <SeatsIndicator
                    totalSeats={trip.total_seats}
                    bookedSeats={trip.booked_seats}
                />
            </div>
          </div>

          {/* Description */}
          {tripDesc && (
            <div className="rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4">{t('common.description')}</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">{tripDesc}</p>
            </div>
          )}
        </div>

        {/* Sidebar: Booking section (Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32 rounded-[2.5rem] bg-slate-900 text-white p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t('trips.price_per_seat')}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl xl:text-5xl font-black text-white tracking-tighter">{fmt(trip.price_per_seat)}</p>
                </div>
                </div>

                {isBookable && (
                <>
                    {/* Seats selector */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                    <label className="block text-sm font-bold text-slate-300 mb-4 text-center">
                        {t('booking.seats_count')}
                    </label>
                    <div className="flex items-center justify-between bg-black/20 rounded-xl p-2 border border-white/5">
                        <button
                        onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                        disabled={seatsCount <= 1}
                        className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg xl:rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 text-white"
                        >
                        <Minus className="h-4 w-4 xl:h-5 xl:w-5" />
                        </button>
                        <span className="text-xl xl:text-2xl font-black w-12 xl:w-16 text-center">{seatsCount}</span>
                        <button
                        onClick={() => setSeatsCount(Math.min(maxBookable, seatsCount + 1))}
                        disabled={seatsCount >= maxBookable}
                        className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg xl:rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 text-white"
                        >
                        <Plus className="h-4 w-4 xl:h-5 xl:w-5" />
                        </button>
                    </div>
                    <p className="text-xs font-semibold text-accent mt-3 text-center">
                        {remaining} {t('trips.seats_remaining')}
                    </p>
                    </div>

                    {/* Price summary */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                        <span>
                        {fmt(trip.price_per_seat)} x {seatsCount}
                        </span>
                        <span>{fmt(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg xl:text-xl font-black text-white pt-4 border-t border-white/10">
                        <span>{t('common.total')}</span>
                        <span className="text-primary">{fmt(totalPrice)}</span>
                    </div>
                    </div>

                    {/* Book button */}
                    <Link
                    href={`/${locale}/trips/${trip.id}/book?seats=${seatsCount}`}
                    className="group flex items-center justify-center gap-2 xl:gap-3 w-full py-4 xl:py-5 rounded-xl xl:rounded-2xl bg-primary text-white font-bold text-base xl:text-lg hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-xl shadow-primary/20"
                    >
                    <CreditCard className="h-4 w-4 xl:h-5 xl:w-5" />
                    {t('trips.book_now')}
                    <ArrowRight className="h-4 w-4 xl:h-5 xl:w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </>
                )}

                {isSoldOut && (
                <button
                    disabled
                    className="w-full py-4 xl:py-5 rounded-xl xl:rounded-2xl bg-white/5 text-slate-500 font-bold text-base xl:text-lg cursor-not-allowed border border-white/5"
                >
                    {t('trips.sold_out')}
                </button>
                )}

                {isNotAvailable && (
                <button
                    disabled
                    className="w-full py-4 xl:py-5 rounded-xl xl:rounded-2xl bg-destructive/20 text-destructive font-bold text-base xl:text-lg cursor-not-allowed border border-destructive/20"
                >
                    {t('trips.not_available')}
                </button>
                )}

                <p className="text-[10px] xl:text-xs font-medium text-slate-500 text-center leading-relaxed">
                {t('booking.terms_agreement')}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Mobile Sticky Bottom Bar (Moved outside animating wrapper) */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('trips.price_per_seat')}</span>
                <span className="text-2xl font-black text-white">{fmt(trip.price_per_seat)}</span>
            </div>
            
            {isBookable ? (
                <Link
                href={`/${locale}/trips/${trip.id}/book?seats=1`}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-base active:scale-[0.98] transition-all"
                >
                <CreditCard className="h-5 w-5" />
                {t('trips.book_now')}
                </Link>
            ) : isSoldOut ? (
                <button disabled className="flex-1 py-3.5 rounded-xl bg-white/5 text-slate-500 font-bold text-base border border-white/5">
                {t('trips.sold_out')}
                </button>
            ) : (
                <button disabled className="flex-1 py-3.5 rounded-xl bg-destructive/20 text-destructive font-bold text-base border border-destructive/20">
                {t('trips.not_available')}
                </button>
            )}
        </div>
    </div>
    </>
  )
}
