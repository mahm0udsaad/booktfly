'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import type { ProviderApplication } from '@/types'
import { APPLICATION_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react'

const statusStylesMap = {
  pending_review: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]",
    iconAnim: "animate-pulse"
  },
  approved: {
    bg: "bg-green-500/10 dark:bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-600 dark:text-green-400",
    glow: "shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]",
    iconAnim: ""
  },
  rejected: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    glow: "shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]",
    iconAnim: ""
  }
}

export default function ApplicationStatusPage() {
  const t = useTranslations('become_provider')
  const ts = useTranslations('status')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [application, setApplication] = useState<ProviderApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch('/api/providers/my-application')
        const result = await res.json()
        if (!res.ok) {
          setError(result.error)
          return
        }
        setApplication(result.data)
      } catch {
        setError('Failed to fetch application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">
            {locale === 'ar' ? 'جاري تحميل الحالة...' : 'Loading status...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen pt-44 pb-16 flex items-center justify-center bg-muted/20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/50 p-8 rounded-3xl text-center max-w-md shadow-lg"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {locale === 'ar' ? 'لم يتم العثور على طلب' : 'No Application Found'}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {error || tc('no_results')}
          </p>
          <Link
            href={`/${locale}/become-provider/apply`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('apply_now')}
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </Link>
        </motion.div>
      </div>
    )
  }

  const StatusIcon =
    application.status === 'approved'
      ? CheckCircle2
      : application.status === 'rejected'
        ? XCircle
        : Clock

  const isPending = application.status === 'pending_review'
  const isApproved = application.status === 'approved'
  const isRejected = application.status === 'rejected'

  const statusStyles = statusStylesMap[application.status as keyof typeof statusStylesMap] || { bg: "", border: "", text: "", glow: "", iconAnim: "" };

  return (
    <div className="min-h-screen pt-44 pb-16 px-4 bg-muted/20 relative overflow-hidden">
      {/* Background Decor */}
      {isApproved && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />}
      {isPending && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />}
      
      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {t('application_status')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'ar' ? 'تابع حالة طلب انضمامك كمزود خدمة' : 'Track your provider application progress'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "bg-card border-2 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden",
            statusStyles.border,
            statusStyles.glow
          )}
        >
          {/* Subtle top gradient bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-1.5", statusStyles.bg, "opacity-50")} />

          {/* Status Icon */}
          <div className="relative mb-8">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mx-auto z-10 relative',
                statusStyles.bg,
                statusStyles.text
              )}
            >
              <StatusIcon className={cn("h-12 w-12", statusStyles.iconAnim)} />
            </div>
            {isPending && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-amber-500/20 rounded-full animate-ping -z-0" />
            )}
          </div>

          {/* Status Label */}
          <div className="mb-8">
            <h2 className={cn("text-2xl font-bold mb-2", statusStyles.text)}>
              {ts(application.status)}
            </h2>
            {isPending && (
              <p className="text-muted-foreground font-medium">
                {locale === 'ar'
                  ? 'طلبك قيد المراجعة من قبل فريقنا. سيتم الرد قريباً.'
                  : 'Your application is being reviewed by our team. We will get back to you shortly.'}
              </p>
            )}
            {isApproved && (
              <p className="text-muted-foreground font-medium">
                {locale === 'ar'
                  ? 'تهانينا! تمت الموافقة على طلبك بنجاح.'
                  : 'Congratulations! Your application has been approved.'}
              </p>
            )}
          </div>

          <div className="w-full h-px bg-border/50 my-8" />

          {/* Company & Details Card */}
          <div className="bg-muted/30 rounded-2xl p-6 text-start space-y-4 border border-border/50">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                   {locale === 'ar' ? 'الشركة' : 'Company'}
                </p>
                <p className="text-foreground font-semibold text-lg">{application.company_name_ar}</p>
                {application.company_name_en && (
                  <p className="text-sm text-muted-foreground">
                    {application.company_name_en}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                   {locale === 'ar' ? 'تاريخ التقديم' : 'Submitted On'}
                </p>
                <p className="text-foreground font-medium">
                  {new Date(application.created_at).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {isRejected && application.admin_comment && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-start overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-semibold text-red-600">
                  {t('rejection_reason')}
                </p>
              </div>
              <p className="text-sm text-red-600/90 leading-relaxed ps-7">
                {application.admin_comment}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="pt-8 space-y-4">
            {isRejected && (
              <Link
                href={`/${locale}/become-provider/apply`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-primary/20"
              >
                <RefreshCw className="h-5 w-5" />
                {t('reapply')}
              </Link>
            )}

            {isApproved && (
              <Link
                href={`/${locale}/provider/dashboard`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-primary/20 group"
              >
                {locale === 'ar' ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 rtl:-scale-x-100" />
              </Link>
            )}

            {isPending && (
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium py-3 px-4 rounded-xl border border-amber-500/20">
                {locale === 'ar'
                  ? 'توقع رداً منا قريباً على بريدك الإلكتروني.'
                  : 'Expect to hear back from us soon via email.'}
              </div>
            )}
            
            <Link 
              href={`/${locale}`}
              className="block mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === 'ar' ? 'العودة للرئيسية' : 'Return to Homepage'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}