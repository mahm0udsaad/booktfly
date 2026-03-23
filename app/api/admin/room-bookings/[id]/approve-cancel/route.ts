import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { action } = body as { action: 'approve' | 'reject' }

    const { data: booking } = await supabaseAdmin
      .from('room_bookings')
      .select('*, room:rooms(name_ar, name_en, city_ar, city_en)')
      .eq('id', id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Room booking not found' }, { status: 404 })
    if (booking.status !== 'cancellation_pending') {
      return NextResponse.json({ error: 'Booking is not pending cancellation' }, { status: 400 })
    }

    const roomInfo = booking.room as any

    if (action === 'approve') {
      const wasConfirmed = booking.paid_at !== null

      await supabaseAdmin
        .from('room_bookings')
        .update({
          status: 'cancelled',
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (wasConfirmed) {
        try {
          const ref = booking.id.slice(0, 8)
          await supabaseAdmin.rpc('debit_wallet', {
            p_provider_id: booking.provider_id,
            p_amount: booking.provider_payout,
            p_booking_id: booking.id,
            p_type: 'debit',
            p_desc_ar: `إلغاء حجز غرفة رقم ${ref}`,
            p_desc_en: `Cancelled room booking #${ref}`,
          })
        } catch (walletErr) {
          console.error('Failed to debit wallet:', walletErr)
        }
      }

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'room_booking_cancelled',
          titleAr: 'تم قبول طلب إلغاء حجز الغرفة',
          titleEn: 'Your room cancellation request has been approved',
          bodyAr: `تم إلغاء حجز الغرفة "${roomInfo?.name_ar || ''}"`,
          bodyEn: `Your room booking for "${roomInfo?.name_en || roomInfo?.name_ar || ''}" has been cancelled.`,
          data: { room_booking_id: id },
        })
      }
    } else {
      await supabaseAdmin
        .from('room_bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'cancellation_rejected',
          titleAr: 'تم رفض طلب إلغاء حجز الغرفة',
          titleEn: 'Your room cancellation request was rejected',
          bodyAr: `تم رفض طلب إلغاء حجز الغرفة "${roomInfo?.name_ar || ''}"`,
          bodyEn: `Your cancellation request for room "${roomInfo?.name_en || roomInfo?.name_ar || ''}" was rejected.`,
          data: { room_booking_id: id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
