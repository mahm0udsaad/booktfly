'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { FileText, Building2, Plane, BookOpen, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const supabase = createClient()
  const [stats, setStats] = useState({
    pendingApps: 0,
    activeProviders: 0,
    activeTrips: 0,
    monthBookings: 0,
    monthRevenue: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [apps, providers, trips, bookings] = await Promise.all([
        supabase.from('provider_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bookings').select('commission_amount').eq('status', 'confirmed').gte('created_at', startOfMonth),
      ])

      setStats({
        pendingApps: apps.count || 0,
        activeProviders: providers.count || 0,
        activeTrips: trips.count || 0,
        monthBookings: bookings.data?.length || 0,
        monthRevenue: bookings.data?.reduce((sum, b) => sum + Number(b.commission_amount), 0) || 0,
      })
    }
    fetchStats()
  }, [supabase])

  const cards = [
    {
      label: t('applications'),
      value: stats.pendingApps,
      icon: FileText,
      href: `/${locale}/admin/applications?status=pending_review`,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      suffix: isAr ? 'معلق' : 'pending',
    },
    {
      label: t('providers'),
      value: stats.activeProviders,
      icon: Building2,
      href: `/${locale}/admin/providers`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: t('trips'),
      value: stats.activeTrips,
      icon: Plane,
      href: `/${locale}/admin/trips`,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      label: t('bookings'),
      value: stats.monthBookings,
      icon: BookOpen,
      href: `/${locale}/admin/bookings`,
      color: 'text-primary',
      bg: 'bg-primary/10',
      suffix: isAr ? 'هذا الشهر' : 'this month',
    },
    {
      label: t('revenue'),
      value: `${stats.monthRevenue.toLocaleString()}`,
      icon: DollarSign,
      href: `/${locale}/admin/revenue`,
      color: 'text-slate-900',
      bg: 'bg-slate-100',
      suffix: isAr ? 'عمولات هذا الشهر' : 'commissions this month',
      extra: isAr ? 'ر.س' : 'SAR'
    },
  ]

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-in-up">
      <div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t('dashboard')}</h1>
         <p className="text-slate-500 font-medium">{isAr ? 'نظرة عامة على أداء المنصة' : 'Platform performance overview'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, idx) => (
          <Link
            key={card.label}
            href={card.href}
            className="group bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", card.bg)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <TrendingUp className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1">
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                 {card.extra && <span className="text-sm font-bold text-slate-500">{card.extra}</span>}
              </div>
              {card.suffix && (
                <p className="text-xs font-semibold text-slate-400 mt-2">{card.suffix}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
