'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { TripStatus } from '@/types'

type TripStatusBadgeProps = {
  status: TripStatus
  className?: string
}

export function TripStatusBadge({ status, className }: TripStatusBadgeProps) {
  const t = useTranslations('status')

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5',
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all hover:scale-105',
        statusStyles[status as keyof typeof statusStyles] || 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      <span className="relative flex h-2 w-2 me-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          status === 'active' ? "bg-emerald-400" : "bg-muted-foreground"
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          status === 'active' ? "bg-emerald-500" : "bg-muted-foreground"
        )}></span>
      </span>
      {t(status)}
    </span>
  )
}