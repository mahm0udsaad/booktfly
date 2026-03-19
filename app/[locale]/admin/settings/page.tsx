'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/toaster'
import { Settings, Save, Landmark } from 'lucide-react'

export default function AdminSettings() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const supabase = createClient()
  const [commissionRate, setCommissionRate] = useState('10')
  const [termsAr, setTermsAr] = useState('')
  const [termsEn, setTermsEn] = useState('')
  const [bankNameAr, setBankNameAr] = useState('')
  const [bankNameEn, setBankNameEn] = useState('')
  const [bankIban, setBankIban] = useState('')
  const [bankHolderAr, setBankHolderAr] = useState('')
  const [bankHolderEn, setBankHolderEn] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setCommissionRate(String(data.default_commission_rate))
        setTermsAr(data.terms_content_ar || '')
        setTermsEn(data.terms_content_en || '')
        setBankNameAr(data.bank_name_ar || '')
        setBankNameEn(data.bank_name_en || '')
        setBankIban(data.bank_iban || '')
        setBankHolderAr(data.bank_account_holder_ar || '')
        setBankHolderEn(data.bank_account_holder_en || '')
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_commission_rate: Number(commissionRate),
          terms_content_ar: termsAr,
          terms_content_en: termsEn,
          bank_name_ar: bankNameAr,
          bank_name_en: bankNameEn,
          bank_iban: bankIban,
          bank_account_holder_ar: bankHolderAr,
          bank_account_holder_en: bankHolderEn,
        }),
      })
      if (res.ok) {
        toast({ title: locale === 'ar' ? 'تم الحفظ' : 'Saved', variant: 'success' })
      } else {
        toast({ title: locale === 'ar' ? 'حدث خطأ' : 'Error', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse p-8">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>

  const inputClass = 'w-full p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        {t('settings')}
      </h1>

      <div className="space-y-6">
        {/* Commission */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">{t('commission_settings')}</h3>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              {t('default_commission')} (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full max-w-xs p-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              min="0"
              max="100"
              step="0.5"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {locale === 'ar'
                ? 'يطبق على جميع المزودين الذين ليس لديهم نسبة خاصة'
                : 'Applied to all providers without a custom rate'}
            </p>
          </div>
        </div>

        {/* Bank Transfer Info */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            {locale === 'ar' ? 'بيانات الحساب البنكي' : 'Bank Account Details'}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {locale === 'ar'
              ? 'هذه البيانات ستظهر للمستخدمين عند الدفع بالتحويل البنكي'
              : 'These details will be shown to users during bank transfer payment'}
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">IBAN</label>
              <input value={bankIban} onChange={(e) => setBankIban(e.target.value)} dir="ltr" className={inputClass} placeholder="SA0380000000608010167519" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  {locale === 'ar' ? 'اسم البنك (عربي)' : 'Bank Name (Arabic)'}
                </label>
                <input value={bankNameAr} onChange={(e) => setBankNameAr(e.target.value)} dir="rtl" className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  {locale === 'ar' ? 'اسم البنك (إنجليزي)' : 'Bank Name (English)'}
                </label>
                <input value={bankNameEn} onChange={(e) => setBankNameEn(e.target.value)} dir="ltr" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  {locale === 'ar' ? 'اسم صاحب الحساب (عربي)' : 'Account Holder (Arabic)'}
                </label>
                <input value={bankHolderAr} onChange={(e) => setBankHolderAr(e.target.value)} dir="rtl" className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  {locale === 'ar' ? 'اسم صاحب الحساب (إنجليزي)' : 'Account Holder (English)'}
                </label>
                <input value={bankHolderEn} onChange={(e) => setBankHolderEn(e.target.value)} dir="ltr" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">{t('terms_conditions')}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                {locale === 'ar' ? 'الشروط والأحكام (عربي)' : 'Terms & Conditions (Arabic)'}
              </label>
              <textarea value={termsAr} onChange={(e) => setTermsAr(e.target.value)} className="w-full p-3 rounded-lg border text-sm min-h-40 focus:outline-none focus:ring-2 focus:ring-accent" dir="rtl" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                {locale === 'ar' ? 'الشروط والأحكام (إنجليزي)' : 'Terms & Conditions (English)'}
              </label>
              <textarea value={termsEn} onChange={(e) => setTermsEn(e.target.value)} className="w-full p-3 rounded-lg border text-sm min-h-40 focus:outline-none focus:ring-2 focus:ring-accent" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          <Save className="h-5 w-5" />
          {saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
        </button>
      </div>
    </div>
  )
}
