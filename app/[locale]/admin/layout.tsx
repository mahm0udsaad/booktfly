import { AdminSidebar } from '@/components/layout/admin-sidebar'

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 w-full">
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
