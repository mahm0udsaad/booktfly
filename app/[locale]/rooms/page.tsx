'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Search,
  SlidersHorizontal,
  X,
  BedDouble,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoomCard } from '@/components/rooms/room-card'
import { EmptyState } from '@/components/shared/empty-state'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { ROOM_CATEGORIES } from '@/lib/constants'
import type { Room } from '@/types'
import { useSearchParams } from 'next/navigation'

type Filters = {
  city: string
  category: string
  price_min: string
  price_max: string
  capacity_min: string
  sort: string
}

const initialFilters: Filters = {
  city: '',
  category: '',
  price_min: '',
  price_max: '',
  capacity_min: '',
  sort: 'newest',
}

function RoomsContent() {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'
  const searchParams = useSearchParams()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState<Filters>(() => ({
    ...initialFilters,
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
  }))

  const [showFilters, setShowFilters] = useState(false)
  const [searchCity, setSearchCity] = useState(filters.city)

  const fetchRooms = useCallback(
    async (pageNum: number, append = false, overrideCity?: string) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      const city = overrideCity ?? searchCity

      try {
        const params = new URLSearchParams()
        params.set('page', String(pageNum))
        params.set('limit', '12')
        if (city) params.set('city', city)
        if (filters.category) params.set('category', filters.category)
        if (filters.price_min) params.set('price_min', filters.price_min)
        if (filters.price_max) params.set('price_max', filters.price_max)
        if (filters.capacity_min) params.set('capacity_min', filters.capacity_min)
        if (filters.sort) params.set('sort', filters.sort)

        const res = await fetch(`/api/rooms?${params.toString()}`)
        const data = await res.json()

        if (append) {
          setRooms((prev) => [...prev, ...(data.rooms || [])])
        } else {
          setRooms(data.rooms || [])
        }
        setTotalPages(data.totalPages || 1)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchCity, filters.category, filters.price_min, filters.price_max, filters.capacity_min, filters.sort]
  )

  const handleSearch = useCallback(() => {
    setSearchCity(filters.city)
    setPage(1)
    fetchRooms(1, false, filters.city)
  }, [filters.city, fetchRooms])

  const filterDepsRef = useRef({ category: filters.category, price_min: filters.price_min, price_max: filters.price_max, capacity_min: filters.capacity_min, sort: filters.sort })
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true
      fetchRooms(1)
      filterDepsRef.current = { category: filters.category, price_min: filters.price_min, price_max: filters.price_max, capacity_min: filters.capacity_min, sort: filters.sort }
      return
    }
    const prev = filterDepsRef.current
    const changed = prev.category !== filters.category || prev.price_min !== filters.price_min || prev.price_max !== filters.price_max || prev.capacity_min !== filters.capacity_min || prev.sort !== filters.sort
    if (changed) {
      filterDepsRef.current = { category: filters.category, price_min: filters.price_min, price_max: filters.price_max, capacity_min: filters.capacity_min, sort: filters.sort }
      setPage(1)
      fetchRooms(1)
    }
  }, [filters.category, filters.price_min, filters.price_max, filters.capacity_min, filters.sort, fetchRooms])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchRooms(nextPage, true)
  }

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setSearchCity('')
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== 'sort' && val !== ''
  )
  const activeFilterLabels = [
    searchCity && `${isAr ? 'المدينة' : 'City'}: ${searchCity}`,
    filters.category && `${isAr ? 'الفئة' : 'Category'}: ${isAr ? ROOM_CATEGORIES[filters.category as keyof typeof ROOM_CATEGORIES]?.ar : ROOM_CATEGORIES[filters.category as keyof typeof ROOM_CATEGORIES]?.en}`,
    filters.capacity_min && `${isAr ? 'ابتداءً من' : 'Min'} ${filters.capacity_min} ${t('rooms.guests')}`,
    filters.price_min && `${isAr ? 'السعر من' : 'Price from'} ${filters.price_min}`,
    filters.price_max && `${isAr ? 'السعر إلى' : 'Price to'} ${filters.price_max}`,
  ].filter(Boolean) as string[]

  const inputClass = 'w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-slate-50 border-none text-slate-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-32 md:pb-16 lg:pt-36 lg:pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">
          {t('rooms.browse_title')}
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-medium px-4">
          {t('rooms.search_placeholder')}
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 relative z-20">
        {/* Row 1: City Search & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={filters.city}
              onChange={(e) => updateFilter('city', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('rooms.filter_city')}
              className="w-full h-12 md:h-14 px-4 rounded-2xl bg-slate-50 border-none text-slate-700 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none hover:bg-slate-100 transition-colors"
            />
          </div>

          <div className="relative sm:col-span-1">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="appearance-none w-full h-12 md:h-14 px-4 pe-10 rounded-2xl bg-slate-50 border-none text-slate-700 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="">{t('rooms.filter_category')}</option>
              {Object.entries(ROOM_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {isAr ? val.ar : val.en}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 h-12 md:h-14 px-6 rounded-2xl bg-primary text-white font-bold transition-all shadow-sm shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="h-5 w-5" />
            <span>{t('common.search')}</span>
          </button>
        </div>

        {/* Row 2: Sort & More Filters */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none w-40 md:w-48 h-10 px-4 pe-10 rounded-xl bg-slate-50 border-none text-slate-700 font-semibold text-xs md:text-sm focus:ring-2 focus:ring-primary focus:outline-none hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <option value="newest">{t('rooms.sort_newest')}</option>
                <option value="price_asc">{t('rooms.sort_price_asc')}</option>
                <option value="price_desc">{t('rooms.sort_price_desc')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* More Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-xs md:text-sm transition-all',
                showFilters
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('common.filter')}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Extra Filter panel */}
      {showFilters && (
        <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 bg-white p-5 md:p-8 mb-8 md:mb-12 shadow-xl shadow-slate-200/40 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-5 md:mb-6">{t('common.filter')}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Price min */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('rooms.filter_price')} ({t('common.from')})
              </label>
              <input
                type="number"
                min="0"
                value={filters.price_min}
                onChange={(e) => updateFilter('price_min', e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            {/* Price max */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('rooms.filter_price')} ({t('common.to')})
              </label>
              <input
                type="number"
                min="0"
                value={filters.price_max}
                onChange={(e) => updateFilter('price_max', e.target.value)}
                placeholder="10000"
                className={inputClass}
              />
            </div>
            {/* Capacity */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('rooms.filter_capacity')}
              </label>
              <input
                type="number"
                min="1"
                value={filters.capacity_min}
                onChange={(e) => updateFilter('capacity_min', e.target.value)}
                placeholder="1"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {rooms.length > 0
                ? (isAr ? `${rooms.length} نتيجة معروضة` : `${rooms.length} result${rooms.length === 1 ? '' : 's'} shown`)
                : (isAr ? 'لا توجد نتائج حالياً' : 'No results right now')}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {isAr
                ? 'حدّث الفلاتر أو وسّع البحث للعثور على خيارات أكثر'
                : 'Adjust filters or widen the search to find more options'}
            </p>
          </div>

          {activeFilterLabels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilterLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <EmptyState
            icon={BedDouble}
            message={t('rooms.no_rooms')}
            actionLabel={hasActiveFilters ? t('common.cancel') : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rooms.map((room, idx) => (
              <div key={room.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx % 6) * 100}ms` }}>
                <RoomCard room={room} />
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

export default function RoomsPage() {
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
      <RoomsContent />
    </Suspense>
  )
}
