'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'

type RoomImageGalleryProps = {
  images: string[]
  name: string
  className?: string
}

export function RoomImageGallery({ images, name, className }: RoomImageGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={cn('w-full aspect-[16/10] rounded-2xl bg-slate-100 flex items-center justify-center', className)}>
        <BedDouble className="h-16 w-16 text-slate-300" />
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <div className={cn('relative w-full aspect-[16/10] rounded-2xl overflow-hidden group', className)}>
      <img
        src={images[current]}
        alt={`${name} - ${current + 1}`}
        className="w-full h-full object-cover transition-transform duration-500"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
