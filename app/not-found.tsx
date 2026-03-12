import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="text-8xl font-black text-slate-200 mb-4">404</div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Page not found - الصفحة غير موجودة
          </h2>
          <Link
            href="/ar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors mt-6"
          >
            الرئيسية - Home
          </Link>
        </div>
      </body>
    </html>
  )
}
