import { Plane, Building2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface StatsSectionProps {
  tripsCount: number
  providersCount: number
  bookingsCount: number
}

export function StatsSection({ tripsCount, providersCount, bookingsCount }: StatsSectionProps) {
  const t = useTranslations('homepage')

  const stats = [
    { 
      icon: Plane, 
      value: tripsCount, 
      label: t('stats_trips'), 
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-primary/10"
    },
    { 
      icon: Building2, 
      value: providersCount, 
      label: t('stats_providers'), 
      color: "text-accent",
      bg: "bg-accent/5",
      border: "border-accent/10"
    },
    { 
      icon: Users, 
      value: bookingsCount, 
      label: t('stats_travelers'), 
      color: "text-emerald-500",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10"
    },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={stat.label}
              className={cn(
                  "group relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-8 lg:p-10 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up",
                  `hover:${stat.border}`
              )}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Subtle background wash on hover */}
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", stat.bg)} />
              
              <div className="relative z-10 flex flex-row md:flex-col items-center md:justify-center gap-6 md:gap-0 text-start md:text-center">
                <div className={cn(
                    "flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl md:mb-8 border border-slate-100 bg-slate-50 transition-transform duration-500 group-hover:scale-110 shadow-sm shrink-0",
                    "group-hover:bg-white",
                    stat.color
                )}>
                  <stat.icon className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                
                <div className="flex flex-col items-start md:items-center">
                   <div className="flex items-baseline gap-1 mb-1 md:mb-2">
                       <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                       {stat.value}
                       </p>
                       <span className={cn("text-2xl sm:text-3xl font-black", stat.color)}>+</span>
                   </div>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}