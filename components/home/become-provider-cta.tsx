import { Building2, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface BecomeProviderCTAProps {
  locale: string
}

export function BecomeProviderCTA({ locale }: BecomeProviderCTAProps) {
  const t = useTranslations('homepage')
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white overflow-hidden shadow-2xl shadow-slate-900/10 transition-transform duration-500 hover:scale-[1.01]"
        >
          {/* Elegant geometric overlays */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/30 to-transparent rounded-full blur-3xl -mr-[20%] -mt-[20%] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl -ml-[10%] -mb-[10%] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-8 border border-white/10 shadow-inner">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
              {t('for_providers_title')}
            </h2>
            <p className="text-lg lg:text-xl text-slate-300 mb-10 font-medium leading-relaxed">
              {t('for_providers_desc')}
            </p>
            
            <Link
              href={`/${locale}/become-provider`}
              className="group inline-flex items-center justify-center gap-4 px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-1"
            >
              {t('for_providers_cta')}
              <Arrow className="h-5 w-5 text-slate-400 rtl:rotate-180 group-hover:text-slate-900 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
