'use client'

import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type SeatsIndicatorProps = {
  totalSeats: number
  bookedSeats: number
  className?: string
  compact?: boolean
}

export function SeatsIndicator({
  totalSeats,
  bookedSeats,
  className,
  compact = false,
}: SeatsIndicatorProps) {
  const t = useTranslations('trips')
  const locale = useLocale()
  const remaining = totalSeats - bookedSeats
  const percentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0

  const barColor =
    percentage >= 90
      ? 'bg-gradient-to-r from-destructive/80 to-destructive shadow-lg shadow-destructive/20'
      : percentage >= 70
        ? 'bg-gradient-to-r from-warning/80 to-warning shadow-lg shadow-warning/20'
        : 'bg-gradient-to-r from-success/80 to-success shadow-lg shadow-success/20'

  return (
    <div className={cn('w-full', className)}>
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">
            {remaining} {t('seats_remaining')}
          </span>
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            {bookedSeats} / {totalSeats}
          </span>
        </div>
      )}
      <div className="w-full bg-muted/30 dark:bg-white/5 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
        />
      </div>
    </div>
  )
}