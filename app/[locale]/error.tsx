'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3">
          {t('errors.generic')}
        </h2>
        <p className="text-slate-500 font-medium mb-8">
          {error.digest && (
            <span className="block text-xs text-slate-400 mt-2 font-mono">
              {error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {t('common.retry')}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            {t('common.home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
