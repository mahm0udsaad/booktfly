'use client'

import { useLocale } from 'next-intl'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type LastMinuteBadgeProps = {
  discount?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LastMinuteBadge({ discount, className, size = 'sm' }: LastMinuteBadgeProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-bold rounded-full',
        'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        'shadow-sm shadow-orange-500/20',
        sizes[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], 'animate-pulse')} />
      <span>{isAr ? 'لحظة أخيرة' : 'Last Minute'}</span>
      {discount != null && discount > 0 && (
        <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[9px] font-black">
          {discount}%
        </span>
      )}
    </div>
  )
}
