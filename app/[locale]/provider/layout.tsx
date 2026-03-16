import { ProviderSidebar } from '@/components/layout/provider-sidebar'
import { LanguageSwitcher } from '@/components/layout/language-switcher'

type Props = {
  children: React.ReactNode
}

export default function ProviderLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <ProviderSidebar />
      <div className="flex-1 w-full min-w-0">
         <div className="max-w-7xl mx-auto w-full px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
            <div className="flex justify-end">
               <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <LanguageSwitcher />
               </div>
            </div>
         </div>
         <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
         </main>
      </div>
    </div>
  )
}
