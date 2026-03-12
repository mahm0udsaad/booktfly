import { Search, CreditCard, Plane } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export function HowItWorks() {
  const t = useTranslations('homepage')

  const steps = [
    { icon: Search, title: t('step1_title'), desc: t('step1_desc') },
    { icon: CreditCard, title: t('step2_title'), desc: t('step2_desc') },
    { icon: Plane, title: t('step3_title'), desc: t('step3_desc') },
  ]

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 md:mb-6">{t('how_it_works')}</h2>
          <div className="h-1.5 w-16 bg-accent mx-auto rounded-full" />
        </div>
        
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-10 md:top-12 left-[16%] right-[16%] h-[2px] bg-slate-200 z-0" />
          
          {/* Connector Line (Mobile) */}
          <div className="md:hidden absolute top-0 bottom-0 left-12 w-[2px] bg-slate-200 z-0 rtl:left-auto rtl:right-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative z-10">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="relative flex flex-row md:flex-col items-center md:items-center md:text-center group animate-fade-in-up gap-6 md:gap-0"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-200 shadow-sm text-primary md:mb-8 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-md">
                  <step.icon className="h-8 w-8 md:h-10 md:w-10 text-primary transition-colors duration-300 group-hover:text-accent" />
                  <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 h-6 w-6 md:h-8 md:w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-md">
                    {idx + 1}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-slate-900">{step.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed md:max-w-[280px] md:mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}