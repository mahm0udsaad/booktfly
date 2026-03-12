'use client'

import { Suspense, useEffect, useState, use } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  CreditCard,
  IdCard,
  MapPin,
  Calendar,
  ShieldCheck
} from 'lucide-react'
import { cn, formatPrice, formatPriceEN } from '@/lib/utils'
import { MAX_SEATS_PER_BOOKING } from '@/lib/constants'
import { TRIP_TYPES, CABIN_CLASSES } from '@/lib/constants'
import { DetailPageSkeleton } from '@/components/shared/loading-skeleton'
import { getBookingSchema } from '@/lib/validations'
import { toast } from '@/components/ui/toaster'
import type { Trip } from '@/types'

type BookingFormData = { passenger_name: string; passenger_phone: string; passenger_email: string; passenger_id_number?: string }

export default function BookTripPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <BookTripContent params={params} />
    </Suspense>
  )
}

function BookTripContent({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const t = useTranslations()
  const locale = useLocale() as 'ar' | 'en'
  const isAr = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id: tripId } = use(params)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [seatsCount, setSeatsCount] = useState(
    parseInt(searchParams.get('seats') || '1', 10)
  )

  const Arrow = isAr ? ArrowLeft : ArrowRight
  const Back = isAr ? ChevronRight : ChevronLeft

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(getBookingSchema(locale).omit({ trip_id: true, seats_count: true })),
  })

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

  if (!trip || trip.status !== 'active') {
    router.push(`/${locale}/trips/${tripId}`)
    return null
  }

  const remaining = trip.total_seats - trip.booked_seats
  const maxBookable = Math.min(remaining, MAX_SEATS_PER_BOOKING)
  const totalPrice = trip.price_per_seat * seatsCount
  const fmt = isAr ? formatPrice : formatPriceEN

  const originCity = isAr ? trip.origin_city_ar : (trip.origin_city_en || trip.origin_city_ar)
  const destCity = isAr ? trip.destination_city_ar : (trip.destination_city_en || trip.destination_city_ar)

  const departureDate = new Date(trip.departure_at).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          passenger_name: data.passenger_name,
          passenger_phone: data.passenger_phone,
          passenger_email: data.passenger_email,
          passenger_id_number: data.passenger_id_number || undefined,
          seats_count: seatsCount,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast({
          title: t('common.error'),
          description: result.error || t('errors.generic'),
          variant: 'destructive',
        })
        return
      }

      // Redirect to checkout page
      router.push(`/${locale}/checkout/${result.bookingId}`)
    } catch {
      toast({
        title: t('common.error'),
        description: t('errors.network_error'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

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

      <div className="mb-8 md:mb-10">
         <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{t('booking.title')}</h1>
         <p className="text-sm md:text-lg text-slate-500 font-medium">{isAr ? 'أدخل بيانات المسافر لإتمام الحجز' : 'Enter passenger details to complete your booking'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Form Area */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          {/* Trip summary card (Mini Ticket) */}
          <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
             
             <div className="flex-1 ml-4 rtl:ml-0 rtl:mr-4">
                 <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        <Plane className="h-4 w-4 md:h-5 md:w-5 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 block leading-none mb-1 truncate">{trip.airline}</span>
                        {trip.flight_number && (
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest">{trip.flight_number}</span>
                        )}
                    </div>
                 </div>

                 <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 truncate">{originCity}</span>
                    <Arrow className="h-4 w-4 md:h-5 md:w-5 text-slate-300 rtl:rotate-180 shrink-0" />
                    <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 truncate">{destCity}</span>
                 </div>
             </div>

             <div className="hidden sm:block w-px h-12 md:h-16 bg-slate-100" />

             <div className="flex flex-row sm:flex-col gap-2 md:gap-3 sm:min-w-[160px] md:min-w-[200px] overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600 bg-slate-50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-slate-100 whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 shrink-0" />
                    <span>{departureDate}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="px-2 md:px-3 py-1 rounded-md md:rounded-lg bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        {isAr ? TRIP_TYPES[trip.trip_type].ar : TRIP_TYPES[trip.trip_type].en}
                    </span>
                    <span className="px-2 md:px-3 py-1 rounded-md md:rounded-lg bg-accent/5 border border-accent/10 text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        {isAr ? CABIN_CLASSES[trip.cabin_class].ar : CABIN_CLASSES[trip.cabin_class].en}
                    </span>
                </div>
             </div>
          </div>

          {/* Passenger form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8" id="booking-form">
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                 </div>
                 <h3 className="text-xl md:text-2xl font-black text-slate-900">{t('booking.passenger_details')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  {/* Name */}
                  <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                    <label className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {t('booking.passenger_name')}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register('passenger_name')}
                      className={cn(
                        'w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100',
                        errors.passenger_name && 'ring-2 ring-destructive bg-destructive/5'
                      )}
                      placeholder={isAr ? "الاسم الكامل كما في الهوية" : "Full name as on ID"}
                    />
                    {errors.passenger_name && (
                      <p className="text-xs md:text-sm font-bold text-destructive mt-1.5 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" /> {t('common.required')}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {t('booking.passenger_phone')}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register('passenger_phone')}
                      type="tel"
                      dir="ltr"
                      className={cn(
                        'w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100',
                        errors.passenger_phone && 'ring-2 ring-destructive bg-destructive/5'
                      )}
                      placeholder="+966 50 000 0000"
                    />
                    {errors.passenger_phone && (
                      <p className="text-xs md:text-sm font-bold text-destructive mt-1.5 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" /> {t('common.required')}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {t('booking.passenger_email')}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register('passenger_email')}
                      type="email"
                      dir="ltr"
                      className={cn(
                        'w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100',
                        errors.passenger_email && 'ring-2 ring-destructive bg-destructive/5'
                      )}
                      placeholder="user@example.com"
                    />
                    {errors.passenger_email && (
                      <p className="text-xs md:text-sm font-bold text-destructive mt-1.5 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" /> {t('common.required')}</p>
                    )}
                  </div>

                  {/* ID Number (optional) */}
                  <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                    <label className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <IdCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {t('booking.passenger_id')}
                      <span className="text-slate-400 normal-case tracking-normal">({t('common.optional')})</span>
                    </label>
                    <input
                      {...register('passenger_id_number')}
                      dir="ltr"
                      className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100"
                      placeholder="10xxxxxxxxx"
                    />
                  </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar: Price summary & Actions (Desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl shadow-slate-900/20 text-white border border-slate-800 relative overflow-hidden">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t('booking.price_summary')}</h3>

                {/* Seats selector inside the dark card */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm mb-8">
                    <label className="block text-sm font-bold text-slate-300 mb-4 text-center">
                        {t('booking.seats_count')}
                    </label>
                    <div className="flex items-center justify-between bg-black/20 rounded-xl p-2 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                            disabled={seatsCount <= 1}
                            className="h-12 w-12 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 text-white"
                        >
                            <Minus className="h-5 w-5" />
                        </button>
                        <span className="text-3xl font-black w-16 text-center">{seatsCount}</span>
                        <button
                            type="button"
                            onClick={() => setSeatsCount(Math.min(maxBookable, seatsCount + 1))}
                            disabled={seatsCount >= maxBookable}
                            className="h-12 w-12 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 text-white"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-xs font-semibold text-accent mt-3 text-center">
                        {remaining} {t('trips.seats_remaining')}
                    </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                        <span>{t('trips.price_per_seat')}</span>
                        <span className="font-mono bg-white/10 px-2 py-1 rounded">{fmt(trip.price_per_seat)}</span>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mt-6">
                        <div className="flex items-end justify-between">
                            <span className="text-base font-bold text-slate-300">{t('booking.total_amount')}</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">{fmt(totalPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <button
                type="submit"
                form="booking-form"
                disabled={submitting}
                className="group mt-10 w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                {submitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <CreditCard className="h-6 w-6" />
                )}
                {submitting ? t('common.loading') : t('booking.proceed_to_payment')}
                <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform opacity-50" />
                </button>

                <p className="text-xs font-medium text-slate-500 text-center leading-relaxed mt-6">
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
                <div className="flex items-center gap-2 mb-1">
                    <button
                    type="button"
                    onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                    disabled={seatsCount <= 1}
                    className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-white disabled:opacity-30"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold text-white w-4 text-center">{seatsCount}</span>
                    <button
                    type="button"
                    onClick={() => setSeatsCount(Math.min(maxBookable, seatsCount + 1))}
                    disabled={seatsCount >= maxBookable}
                    className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-white disabled:opacity-30"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
                <span className="text-xl font-black text-primary leading-none">{fmt(totalPrice)}</span>
            </div>
            
            <button
            type="submit"
            form="booking-form"
            disabled={submitting}
            className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
            >
                {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="h-4 w-4" />
            )}
            {submitting ? t('common.loading') : t('booking.proceed_to_payment')}
            </button>
        </div>
    </div>
    </>
  )
}
