import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default async function NotFound() {
  const t = await getTranslations()
  const locale = await getLocale()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center animate-fade-in-up">
        <div className="text-8xl font-black text-slate-200 mb-4">404</div>
        <h2 className="text-3xl font-black text-slate-900 mb-3">
          {t('errors.not_found')}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            {t('common.home')}
          </Link>
          <Link
            href={`/${locale}/trips`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            <Search className="h-4 w-4" />
            {t('trips.browse_title')}
          </Link>
        </div>
      </div>
    </div>
  )
}
