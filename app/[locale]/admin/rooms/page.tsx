'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/toaster'
import { ROOM_STATUS_COLORS, ROOM_CATEGORIES } from '@/lib/constants'
import type { Room } from '@/types'
import { Trash2 } from 'lucide-react'

export default function AdminRooms() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()
  const [rooms, setRooms] = useState<(Room & { provider: { company_name_ar: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  useEffect(() => {
    async function fetchRooms() {
      let query = supabase
        .from('rooms')
        .select('*, provider:providers(company_name_ar)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

      if (statusFilter) query = query.eq('status', statusFilter)

      const { data, count } = await query
      setRooms((data as any) || [])
      setTotal(count || 0)
      setLoading(false)
    }
    fetchRooms()
  }, [statusFilter, page])

  const handleRemove = async (roomId: string) => {
    if (!removeReason.trim()) return
    const res = await fetch(`/api/admin/rooms/${roomId}/remove`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: removeReason }),
    })
    if (res.ok) {
      toast({ title: t('common.success'), variant: 'success' })
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: 'removed' as const } : r)))
      setRemoveId(null)
      setRemoveReason('')
    }
  }

  const statuses = ['', 'active', 'deactivated', 'removed']
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{locale === 'ar' ? 'إدارة الغرف' : 'Rooms Management'}</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s ? 'bg-accent text-accent-foreground border-accent' : 'bg-white hover:bg-muted border-border'
            }`}
          >
            {s ? t(`status.${s}`) : locale === 'ar' ? 'الكل' : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-start p-3 font-medium">{locale === 'ar' ? 'اسم الغرفة' : 'Room Name'}</th>
                <th className="text-start p-3 font-medium">{locale === 'ar' ? 'المدينة' : 'City'}</th>
                <th className="text-start p-3 font-medium">{locale === 'ar' ? 'التصنيف' : 'Category'}</th>
                <th className="text-start p-3 font-medium">{t('admin.providers')}</th>
                <th className="text-start p-3 font-medium">{t('common.price')}</th>
                <th className="text-start p-3 font-medium">{t('common.status')}</th>
                <th className="text-start p-3 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{t('common.loading')}</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{t('common.no_results')}</td></tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{locale === 'ar' ? room.name_ar : (room.name_en || room.name_ar)}</td>
                    <td className="p-3">{locale === 'ar' ? room.city_ar : (room.city_en || room.city_ar)}</td>
                    <td className="p-3">{ROOM_CATEGORIES[room.category as keyof typeof ROOM_CATEGORIES]?.[locale === 'ar' ? 'ar' : 'en'] || room.category}</td>
                    <td className="p-3">{(room.provider as any)?.company_name_ar}</td>
                    <td className="p-3">{room.price_per_night} {locale === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROOM_STATUS_COLORS[room.status]}`}>
                        {t(`status.${room.status}`)}
                      </span>
                    </td>
                    <td className="p-3">
                      {room.status === 'active' && (
                        <>
                          {removeId === room.id ? (
                            <div className="flex gap-2">
                              <input
                                value={removeReason}
                                onChange={(e) => setRemoveReason(e.target.value)}
                                placeholder={locale === 'ar' ? 'سبب الإزالة' : 'Remove reason'}
                                className="p-1.5 text-xs border rounded w-32"
                              />
                              <button onClick={() => handleRemove(room.id)} className="text-xs text-destructive hover:underline">
                                {t('common.confirm')}
                              </button>
                              <button onClick={() => setRemoveId(null)} className="text-xs hover:underline">
                                {t('common.cancel')}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRemoveId(room.id)}
                              className="inline-flex items-center gap-1 text-destructive hover:underline text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              {locale === 'ar' ? 'إزالة' : 'Remove'}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border bg-white hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {locale === 'ar' ? 'السابق' : 'Previous'}
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border bg-white hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {locale === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
