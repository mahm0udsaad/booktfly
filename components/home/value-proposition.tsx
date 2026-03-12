import { ShieldCheck, Clock, CheckCircle2, HeadphonesIcon } from 'lucide-react'

interface ValuePropositionProps {
  locale: string
}

export function ValueProposition({ locale }: ValuePropositionProps) {
  const isAr = locale === 'ar'

  const features = [
    {
      icon: ShieldCheck,
      titleEn: '100% Secure Payments',
      titleAr: 'مدفوعات آمنة 100%',
      descEn: 'Your transactions are protected by industry-leading encryption.',
      descAr: 'معاملاتك محمية بأحدث تقنيات التشفير الرائدة في الصناعة.',
      colSpan: 'md:col-span-2',
      bg: 'bg-white',
      text: 'text-slate-900',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/5',
      border: 'border border-slate-200'
    },
    {
      icon: CheckCircle2,
      titleEn: 'Verified Providers',
      titleAr: 'مزودون معتمدون',
      descEn: 'We strictly vet every travel agency on our platform.',
      descAr: 'نقوم بالتحقق من كل وكالة سفر على منصتنا بدقة.',
      colSpan: 'md:col-span-1',
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      iconColor: 'text-accent',
      iconBg: 'bg-white shadow-sm border border-slate-200',
      border: 'border border-slate-200'
    },
    {
      icon: Clock,
      titleEn: 'Instant Confirmation',
      titleAr: 'تأكيد فوري',
      descEn: 'Get your tickets immediately after booking.',
      descAr: 'احصل على تذاكرك فوراً بعد إتمام الحجز.',
      colSpan: 'md:col-span-1',
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      iconColor: 'text-primary',
      iconBg: 'bg-white shadow-sm border border-slate-200',
      border: 'border border-slate-200'
    },
    {
      icon: HeadphonesIcon,
      titleEn: '24/7 Local Support',
      titleAr: 'دعم فني محلي 24/7',
      descEn: 'Our Saudi-based team is here to help you anytime.',
      descAr: 'فريقنا المحلي متواجد لمساعدتك في أي وقت.',
      colSpan: 'md:col-span-2',
      bg: 'bg-slate-900',
      text: 'text-white',
      descText: 'text-slate-400',
      iconColor: 'text-white',
      iconBg: 'bg-white/10',
      border: 'border border-slate-800'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {isAr ? 'لماذا تحجز عبر منصتنا؟' : 'Why Book with BooktFly?'}
            </h2>
            <p className="text-xl text-slate-500 font-medium">
              {isAr 
                ? 'نقدم لك تجربة حجز سلسة وآمنة مع أفضل وكالات السفر المعتمدة' 
                : 'We provide a seamless and secure booking experience with the best verified travel agencies.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-[2.5rem] p-10 ${feature.colSpan} ${feature.bg} ${feature.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-12 ${feature.iconBg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black mb-3 ${feature.text}`}>
                    {isAr ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className={`text-lg font-medium leading-relaxed ${feature.descText || 'text-slate-500'}`}>
                    {isAr ? feature.descAr : feature.descEn}
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
