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
    <section className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden rounded-[3rem] border border-[#0c4a6e]/10 bg-[linear-gradient(135deg,#082f49_0%,#0c4a6e_42%,#0f766e_100%)] p-12 text-white shadow-2xl shadow-sky-900/20 transition-transform duration-500 hover:scale-[1.01] lg:p-20"
        >
          <div className="pointer-events-none absolute right-0 top-0 -mr-[10%] -mt-[10%] h-[600px] w-[600px] rounded-full bg-[#f97316] opacity-15 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 -mb-[10%] -ml-[10%] h-[500px] w-[500px] rounded-full bg-white opacity-5 blur-[100px]" />
          <div className="pointer-events-none absolute inset-y-0 right-[18%] w-px bg-white/10" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-inner">
              <Building2 className="h-10 w-10 stroke-[2.5] text-[#fbbf24]" />
            </div>
            
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-white/70">
              {locale === 'ar' ? 'لشركات السفر' : 'For travel businesses'}
            </p>
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight lg:text-6xl">
              {t('for_providers_title')}
            </h2>
            <p className="mb-10 text-lg font-medium leading-relaxed text-primary-foreground/90 lg:text-xl">
              {t('for_providers_desc')}
            </p>
            
            <Link
              href={`/${locale}/become-provider`}
              className="group inline-flex items-center justify-center gap-4 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-slate-900 shadow-xl transition-all hover:-translate-y-1 hover:bg-orange-50"
            >
              {t('for_providers_cta')}
              <Arrow className="h-5 w-5 text-orange-500 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
