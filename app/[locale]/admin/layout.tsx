import { AdminSidebar } from '@/components/layout/admin-sidebar'

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 w-full min-w-0">
         <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
         </main>
      </div>
    </div>
  )
}