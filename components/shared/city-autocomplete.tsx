'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

type City = { ar: string; en: string; code: string }

let cachedCities: City[] | null = null

async function fetchCities(): Promise<City[]> {
  if (cachedCities) return cachedCities
  try {
    const res = await fetch('/api/trips/cities')
    const data = await res.json()
    cachedCities = data.cities || []
    return cachedCities!
  } catch {
    return []
  }
}

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export function CityAutocomplete({ value, onChange, placeholder, className }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [cities, setCities] = useState<City[]>([])
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState<City[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCities().then(setCities)
  }, [])

  useEffect(() => {
    if (!value.trim()) {
      setFiltered(cities)
      return
    }
    const q = value.toLowerCase()
    setFiltered(
      cities.filter(
        (c) =>
          c.ar.includes(q) ||
          c.en.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      )
    )
  }, [value, cities])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex-1 group/input">
      <div className="absolute inset-y-0 start-0 pl-5 md:pl-6 flex items-center pointer-events-none">
        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(
          'w-full h-12 md:h-14 ps-12 md:ps-14 pe-4 bg-slate-50 sm:bg-transparent border-none text-slate-900 text-sm md:text-base font-semibold focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:font-medium hover:bg-slate-50 transition-colors',
          className
        )}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full start-0 end-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-48 overflow-y-auto">
          {filtered.map((city) => (
            <button
              key={city.code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(isAr ? city.ar : city.en)
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-900">
                  {isAr ? city.ar : city.en}
                </span>
                <span className="text-xs text-slate-400 ms-2">{city.code}</span>
              </div>
              {!isAr && (
                <span className="text-xs text-slate-400 shrink-0">{city.ar}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
