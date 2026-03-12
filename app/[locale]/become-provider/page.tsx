import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import {
  Users,
  BarChart3,
  Wallet,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Rocket,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function BecomeProviderPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('become_provider')

  const benefits = [
    { icon: Users, text: t('benefit_1') },
    { icon: BarChart3, text: t('benefit_2') },
    { icon: Wallet, text: t('benefit_3') },
  ]

  const steps = [
    { icon: FileText, text: t('step_1') },
    { icon: ClipboardCheck, text: t('step_2') },
    { icon: ShieldCheck, text: t('step_3') },
    { icon: Rocket, text: t('step_4') },
  ]

  const requiredDocs = [
    t('doc_hajj_permit'),
    t('doc_commercial_reg'),
    t('doc_tourism_permit'),
    t('doc_civil_aviation'),
    t('doc_iata_permit'),
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] -left-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <Rocket className="h-4 w-4" />
            <span>{t('title').split(' ')[0] || 'Join'} Our Network</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/become-provider/apply`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              {t('apply_now')}
              <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
            </Link>
            <a
              href="#requirements"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-xl text-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('requirements_title')}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('benefits_title')}
          </h2>
          <div className="w-20 h-1.5 bg-primary/50 mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="group bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg text-foreground font-medium leading-relaxed">
                  {benefit.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process & Requirements Grid */}
      <section id="requirements" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl mb-20 border border-border/50">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Requirements */}
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              {t('requirements_title')}
            </h2>
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <ul className="space-y-4">
                {requiredDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 p-1 rounded-full shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-foreground font-medium block">
                        {doc.replace(/\s*\(.*?\)/, '')}
                      </span>
                      {doc.includes('(') && (
                        <span className="text-sm text-muted-foreground">
                          ({t('optional_document')})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Process Steps */}
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              {t('process_title')}
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {steps.map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-primary/10 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-card border border-border/50 p-6 rounded-2xl shadow-sm group-hover:border-primary/50 transition-colors">
                    <div className="font-bold text-primary mb-1">
                      {locale === 'ar' ? `الخطوة ${i + 1}` : `Step ${i + 1}`}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center mb-10">
        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl" />
        <div className="relative bg-card border border-primary/20 rounded-3xl p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Rocket className="w-64 h-64" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'ar' ? 'هل أنت مستعد لتنمية أعمالك؟' : 'Ready to grow your business?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'انضم إلى شبكة من مزودي الخدمة الذين يزيدون من أرباحهم عبر منصتنا.' 
              : 'Join a network of providers who are increasing their revenue with our platform.'}
          </p>
          <Link
            href={`/${locale}/become-provider/apply`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl text-xl font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/30"
          >
            {t('apply_now')}
            <ArrowRight className="h-6 w-6 rtl:-scale-x-100" />
          </Link>
        </div>
      </section>
    </div>
  )
}
