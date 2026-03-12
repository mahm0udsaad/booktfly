import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TripCard } from '@/components/trips/trip-card'
import type { Trip } from '@/types'

interface FeaturedTripsProps {
  trips: Trip[]
  locale: string
}

export function FeaturedTrips({ trips, locale }: FeaturedTripsProps) {
  const t = useTranslations('homepage')
  const tc = useTranslations('common')
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

  if (!trips || trips.length === 0) return null

  return (
    <section className="py-24 bg-white max-w-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-bold text-accent uppercase tracking-widest">{t('featured_trips')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              {locale === 'ar' ? 'رحلات مختارة بعناية لك' : 'Handpicked Trips for Your Next Journey'}
            </h2>
          </div>
          
          <div>
            <Link
              href={`/${locale}/trips`}
              className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
            >
              {tc('view_all')}
              <Arrow className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div key={trip.id} className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl rounded-[2rem]">
              <TripCard trip={trip} className="h-full border-slate-200 shadow-sm bg-white p-6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
