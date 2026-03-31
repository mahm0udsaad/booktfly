import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'
import { shortId } from '@/lib/utils'

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
      .from('car_bookings')
      .select('*, car:cars(brand_ar, brand_en, model_ar, model_en), provider:providers(user_id)')
      .eq('id', id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Car booking not found' }, { status: 404 })
    if (booking.status !== 'cancellation_pending') {
      return NextResponse.json({ error: 'Booking is not pending cancellation' }, { status: 400 })
    }

    const ref = shortId(id)
    const carInfo = booking.car as any
    const carNameAr = `${carInfo?.brand_ar || ''} ${carInfo?.model_ar || ''}`
    const carNameEn = `${carInfo?.brand_en || carInfo?.brand_ar || ''} ${carInfo?.model_en || carInfo?.model_ar || ''}`

    if (action === 'approve') {
      await supabaseAdmin
        .from('car_bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'car_booking_cancelled',
          titleAr: 'تم إلغاء حجز السيارة',
          titleEn: 'Car booking cancelled',
          bodyAr: `تم إلغاء حجز السيارة رقم ${ref} - "${carNameAr}"`,
          bodyEn: `Car booking #${ref} for "${carNameEn}" has been cancelled.`,
          data: { car_booking_id: id },
        })
      }
    } else {
      await supabaseAdmin
        .from('car_bookings')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'car_booking_confirmed',
          titleAr: 'تم رفض طلب إلغاء حجز السيارة',
          titleEn: 'Car booking cancellation rejected',
          bodyAr: `تم رفض طلب إلغاء حجز السيارة رقم ${ref} - حجزك لا يزال مؤكداً`,
          bodyEn: `Cancellation request for car booking #${ref} was rejected. Your booking remains confirmed.`,
          data: { car_booking_id: id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve car cancel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
