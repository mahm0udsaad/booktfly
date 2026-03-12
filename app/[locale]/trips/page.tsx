'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Search,
  SlidersHorizontal,
  X,
  Plane,
  ChevronDown,
  Loader2,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { TripCard } from '@/components/trips/trip-card'
import { EmptyState } from '@/components/shared/empty-state'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { CityAutocomplete } from '@/components/shared/city-autocomplete'
import type { Trip } from '@/types'
import { useSearchParams } from 'next/navigation'

type Filters = {
  origin: string
  destination: string
  date_from: string
  date_to: string
  price_min: string
  price_max: string
  trip_type: string
  cabin_class: string
  sort: string
}

const initialFilters: Filters = {
  origin: '',
  destination: '',
  date_from: '',
  date_to: '',
  price_min: '',
  price_max: '',
  trip_type: '',
  cabin_class: '',
  sort: 'newest',
}

function TripsContent() {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'
  const searchParams = useSearchParams()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Initialize filters from URL params if available
  const [filters, setFilters] = useState<Filters>(() => ({
    ...initialFilters,
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
  }))
  
  const [showFilters, setShowFilters] = useState(false)

  const debouncedOrigin = useDebounce(filters.origin, 400)
  const debouncedDestination = useDebounce(filters.destination, 400)

  const fetchTrips = useCallback(
    async (pageNum: number, append = false) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      try {
        const params = new URLSearchParams()
        params.set('page', String(pageNum))
        params.set('limit', '12')
        if (debouncedOrigin) params.set('origin', debouncedOrigin)
        if (debouncedDestination) params.set('destination', debouncedDestination)
        if (filters.date_from) params.set('date_from', filters.date_from)
        if (filters.date_to) params.set('date_to', filters.date_to)
        if (filters.price_min) params.set('price_min', filters.price_min)
        if (filters.price_max) params.set('price_max', filters.price_max)
        if (filters.trip_type) params.set('trip_type', filters.trip_type)
        if (filters.cabin_class) params.set('cabin_class', filters.cabin_class)
        if (filters.sort) params.set('sort', filters.sort)

        const res = await fetch(`/api/trips?${params.toString()}`)
        const data = await res.json()

        if (append) {
          setTrips((prev) => [...prev, ...(data.trips || [])])
        } else {
          setTrips(data.trips || [])
        }
        setTotalPages(data.totalPages || 1)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedOrigin, debouncedDestination, filters.date_from, filters.date_to, filters.price_min, filters.price_max, filters.trip_type, filters.cabin_class, filters.sort]
  )

  useEffect(() => {
    setPage(1)
    fetchTrips(1)
  }, [fetchTrips])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchTrips(nextPage, true)
  }

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== 'sort' && val !== ''
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-32 md:pb-16 lg:pt-36 lg:pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">
          {t('trips.browse_title')}
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-medium px-4">
          {t('trips.search_placeholder')}
        </p>
      </div>

      {/* Floating Search & Filter Bar */}
      <div className="bg-white rounded-3xl md:rounded-[2rem] p-2 md:p-3 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-2 md:gap-3 mb-8 relative z-20">
        
        {/* Search Inputs Group */}
        <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-0">
            {/* Origin search */}
            <CityAutocomplete
              value={filters.origin}
              onChange={(val) => updateFilter('origin', val)}
              placeholder={t('trips.filter_origin')}
              className="rounded-2xl sm:rounded-none sm:rounded-s-2xl"
            />

            <div className="hidden sm:block w-px h-8 bg-slate-200 self-center mx-2" />

            {/* Destination search */}
            <CityAutocomplete
              value={filters.destination}
              onChange={(val) => updateFilter('destination', val)}
              placeholder={t('trips.filter_destination')}
              className="rounded-2xl sm:rounded-none sm:rounded-e-2xl"
            />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 sm:w-auto">
            {/* Sort */}
            <div className="relative flex-1 sm:flex-none">
            <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none w-full sm:w-40 md:w-48 h-12 md:h-14 px-4 md:px-6 rounded-2xl bg-slate-50 border-none text-slate-700 font-semibold text-xs md:text-sm pe-10 md:pe-12 focus:ring-2 focus:ring-primary focus:outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <option value="newest">{t('trips.sort_newest')}</option>
                <option value="price_asc">{t('trips.sort_price_asc')}</option>
                <option value="price_desc">{t('trips.sort_price_desc')}</option>
                <option value="date">{t('trips.sort_date')}</option>
            </select>
            <ChevronDown className="absolute end-3 md:end-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter toggle button */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                    'flex items-center justify-center gap-2 h-12 md:h-14 px-4 md:px-6 rounded-2xl font-bold transition-all shadow-sm shrink-0',
                    showFilters
                    ? 'bg-accent text-white shadow-accent/20 hover:bg-accent/90'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                )}
            >
                <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline text-xs md:text-sm">{t('common.filter')}</span>
            </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 bg-white p-5 md:p-8 mb-8 md:mb-12 shadow-xl shadow-slate-200/40 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-5 md:mb-6">
             <h3 className="text-base md:text-lg font-bold text-slate-900">{t('common.filter')}</h3>
             {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {t('common.cancel')}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Date range */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_date')} ({t('common.from')})
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter('date_from', e.target.value)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_date')} ({t('common.to')})
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter('date_to', e.target.value)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100"
              />
            </div>

            {/* Price range */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_price')} ({t('common.from')})
              </label>
              <input
                type="number"
                min="0"
                value={filters.price_min}
                onChange={(e) => updateFilter('price_min', e.target.value)}
                placeholder="0"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_price')} ({t('common.to')})
              </label>
              <input
                type="number"
                min="0"
                value={filters.price_max}
                onChange={(e) => updateFilter('price_max', e.target.value)}
                placeholder="10000"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100"
              />
            </div>

            {/* Trip type */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_type')}
              </label>
              <div className="relative">
                <select
                    value={filters.trip_type}
                    onChange={(e) => updateFilter('trip_type', e.target.value)}
                    className="appearance-none w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100 pr-10 cursor-pointer"
                >
                    <option value="">{t('common.view_all')}</option>
                    <option value="one_way">{t('trips.one_way')}</option>
                    <option value="round_trip">{t('trips.round_trip')}</option>
                </select>
                <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Cabin class */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('trips.filter_cabin')}
              </label>
              <div className="relative">
                <select
                    value={filters.cabin_class}
                    onChange={(e) => updateFilter('cabin_class', e.target.value)}
                    className="appearance-none w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100 pr-10 cursor-pointer"
                >
                    <option value="">{t('common.view_all')}</option>
                    <option value="economy">{t('trips.economy')}</option>
                    <option value="business">{t('trips.business')}</option>
                    <option value="first">{t('trips.first')}</option>
                </select>
                 <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <EmptyState
            icon={Plane}
            message={t('trips.no_trips')}
            actionLabel={hasActiveFilters ? t('common.cancel') : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trips.map((trip, idx) => (
              <div key={trip.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx % 6) * 100}ms` }}>
                <TripCard trip={trip} />
              </div>
            ))}
          </div>

          {/* Load more */}
          {page < totalPages && (
            <div className="flex justify-center mt-12 md:mt-16">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm md:text-base font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5"
              >
                {loadingMore && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />}
                {loadingMore ? t('common.loading') : t('common.view_all')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TripsPage() {
  return (
    <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-32">
                {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    }>
      <TripsContent />
    </Suspense>
  )
}