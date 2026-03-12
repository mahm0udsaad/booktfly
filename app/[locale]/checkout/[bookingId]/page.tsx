'use client'

import { useEffect, useState, use } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { cn, formatPrice, formatPriceEN, shortId } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { DetailPageSkeleton } from '@/components/shared/loading-skeleton'
import type { Booking } from '@/types'

type CheckoutState = 'form' | 'processing' | 'success' | 'failed'

export default function CheckoutPage({ params }: { params: Promise<{ bookingId: string, locale: string }> }) {
  const t = useTranslations()
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()
  const { bookingId } = use(params)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<CheckoutState>('form')

  // Dummy card form state
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const Back = isAr ? ChevronRight : ChevronLeft
  const fmt = isAr ? formatPrice : formatPriceEN

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`)
        const data = await res.json()
        if (data.booking) {
          setBooking(data.booking)
          // If already confirmed, show success
          if (data.booking.status === 'confirmed') {
            setState('success')
          }
        }
      } catch {
        // Error handled
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  if (loading) return <DetailPageSkeleton />

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">{t('errors.not_found')}</h2>
        <button
          onClick={() => router.push(`/${locale}/trips`)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors mt-2"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  const handlePay = async () => {
    // Basic validation for dummy form
    if (cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) {
      toast({
        title: t('common.error'),
        description: t('errors.invalid_input'),
        variant: 'destructive',
      })
      return
    }

    setState('processing')

    // Simulate 2-second payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        setState('success')
      } else {
        setState('failed')
      }
    } catch {
      setState('failed')
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    return cleaned.replace(/(\d{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    }
    return cleaned
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 md:py-24 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-50 border-[6px] border-emerald-100 mb-6 md:mb-8 relative">
           <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 opacity-50" />
           <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight">
          {t('booking.booking_confirmed')}
        </h2>
        <p className="text-base md:text-lg text-slate-500 font-medium mb-6 md:mb-8">
          {t('booking.booking_reference')}: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{shortId(bookingId)}</span>
        </p>
        
        <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-5 md:p-6 mb-8 md:mb-10 text-start space-y-4 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
            <div className="flex justify-between items-center text-xs md:text-sm font-semibold text-slate-600 border-b border-slate-100 pb-3 md:pb-4">
                <span>{t('booking.seats_count')}</span>
                <span className="text-slate-900 bg-slate-50 px-2 md:px-3 py-1 rounded-lg">{booking.seats_count}</span>
            </div>
            <div className="flex justify-between items-center pt-1 md:pt-2">
                <span className="text-sm md:text-base font-bold text-slate-500">{t('booking.total_amount')}</span>
                <span className="text-xl md:text-2xl font-black text-emerald-600">{fmt(booking.total_amount)}</span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link
            href={`/${locale}/my-bookings/${bookingId}`}
            className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-primary text-white text-sm md:text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            {t('booking.view_booking')}
          </Link>
          <Link
            href={`/${locale}/my-bookings`}
            className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 text-slate-700 border border-slate-200 text-sm md:text-base font-bold hover:bg-slate-100 transition-all hover:-translate-y-0.5"
          >
            {t('booking.my_bookings_title')}
          </Link>
        </div>
      </div>
    )
  }

  // Processing state
  if (state === 'processing') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 md:py-32 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent/10 mb-6 md:mb-8">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-accent animate-spin" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight">
          {t('booking.payment_processing')}
        </h2>
        <p className="text-base md:text-lg text-slate-500 font-medium">
          {isAr ? 'يرجى الانتظار، جاري معالجة المدفوعات...' : 'Please wait, processing your payment...'}
        </p>
      </div>
    )
  }

  // Failed state
  if (state === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 md:py-24 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-destructive/10 border-[6px] border-destructive/20 mb-6 md:mb-8">
          <XCircle className="h-10 w-10 md:h-12 md:w-12 text-destructive" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight">
          {t('booking.payment_failed')}
        </h2>
        <p className="text-base md:text-lg text-slate-500 font-medium mb-8 md:mb-10">
          {t('errors.generic')}
        </p>
        <button
          onClick={() => setState('form')}
          className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-slate-900 text-white text-sm md:text-base font-bold hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-0.5"
        >
          {t('booking.try_again')}
        </button>
      </div>
    )
  }

  // Payment form
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 pb-12 md:pt-32 lg:pt-36 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 md:mb-8 transition-colors"
      >
         <div className="p-1.5 md:p-2 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <Back className="h-3 w-3 md:h-4 md:w-4 rtl:rotate-180" />
        </div>
        {t('common.back')}
      </button>

      <div className="mb-8 md:mb-10">
         <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{isAr ? 'الدفع الآمن' : 'Secure Checkout'}</h1>
         <p className="text-sm md:text-base text-slate-500 font-medium">{isAr ? 'أكمل بيانات الدفع لتأكيد حجزك' : 'Complete your payment details to confirm booking'}</p>
      </div>

      {/* Order summary */}
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-5 md:p-6 mb-6 md:mb-8 shadow-sm">
        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6">{t('booking.price_summary')}</h3>
        <div className="flex justify-between items-center text-sm md:text-base font-semibold text-slate-700 mb-4 md:mb-6">
          <span>
            {fmt(booking.price_per_seat)} × {booking.seats_count} {t('common.seats')}
          </span>
          <span className="text-slate-900 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100">{fmt(booking.total_amount)}</span>
        </div>
        <div className="border-t border-slate-100 pt-4 md:pt-6 flex justify-between items-end">
          <span className="text-sm md:text-base font-bold text-slate-900">{t('booking.total_amount')}</span>
          <span className="text-3xl md:text-4xl font-black text-primary tracking-tighter">{fmt(booking.total_amount)}</span>
        </div>
      </div>

      {/* Dummy credit card form */}
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
             <Lock className="h-4 w-4 md:h-5 md:w-5 text-accent" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900">{t('booking.payment_details')}</h3>
        </div>

        <div className="space-y-4 md:space-y-6">
            {/* Card number */}
            <div className="space-y-1.5 md:space-y-2">
                <label className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {isAr ? 'رقم البطاقة' : 'Card Number'}
                </label>
                <input
                    type="text"
                    dir="ltr"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100 placeholder:text-slate-300"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* Expiry */}
                <div className="space-y-1.5 md:space-y-2">
                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {isAr ? 'تاريخ الانتهاء' : 'Expiry'}
                    </label>
                    <input
                    type="text"
                    dir="ltr"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100 placeholder:text-slate-300 text-center"
                    />
                </div>

                {/* CVV */}
                <div className="space-y-1.5 md:space-y-2">
                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                    CVV
                    </label>
                    <input
                    type="text"
                    dir="ltr"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border-none text-slate-900 text-base md:text-lg font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-slate-100 placeholder:text-slate-300 text-center"
                    />
                </div>
            </div>
        </div>

        {/* Pay button */}
        <div className="mt-8 md:mt-10">
            <button
            onClick={handlePay}
            className="group w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-slate-900 text-white font-bold text-base md:text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] lg:hover:-translate-y-1"
            >
            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
            {isAr ? `تأكيد ودفع ${fmt(booking.total_amount)}` : `Confirm & Pay ${fmt(booking.total_amount)}`}
            </button>
        </div>

        <div className="mt-4 md:mt-6 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Lock className="h-3 w-3 md:h-3.5 md:w-3.5" />
          {isAr ? 'مدفوعات آمنة ومشفرة 100%' : '100% Secure & Encrypted'}
        </div>
      </div>
    </div>
  )
}
