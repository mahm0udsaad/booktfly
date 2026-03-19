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
      .from('bookings')
      .select('*, trips:trip_id(origin_city_ar, origin_city_en, destination_city_ar, destination_city_en)')
      .eq('id', id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'cancellation_pending') {
      return NextResponse.json({ error: 'Booking is not pending cancellation' }, { status: 400 })
    }

    const tripInfo = booking.trips as any

    if (action === 'approve') {
      // Cancel the booking
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Release seats
      await supabaseAdmin.rpc('release_seats', {
        p_trip_id: booking.trip_id,
        p_seats: booking.seats_count,
      })

      // Notify buyer
      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'cancellation_approved',
          titleAr: 'تم قبول طلب إلغاء حجزك',
          titleEn: 'Your cancellation request has been approved',
          bodyAr: `تم إلغاء حجزك للرحلة من ${tripInfo?.origin_city_ar || ''} إلى ${tripInfo?.destination_city_ar || ''}`,
          bodyEn: `Your booking for the trip from ${tripInfo?.origin_city_en || tripInfo?.origin_city_ar || ''} to ${tripInfo?.destination_city_en || tripInfo?.destination_city_ar || ''} has been cancelled.`,
          data: { booking_id: id },
        })
      }
    } else {
      // Reject - revert to confirmed
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'cancellation_rejected',
          titleAr: 'تم رفض طلب إلغاء حجزك',
          titleEn: 'Your cancellation request was rejected',
          bodyAr: `تم رفض طلب إلغاء حجزك للرحلة من ${tripInfo?.origin_city_ar || ''} إلى ${tripInfo?.destination_city_ar || ''}`,
          bodyEn: `Your cancellation request for the trip from ${tripInfo?.origin_city_en || tripInfo?.origin_city_ar || ''} to ${tripInfo?.destination_city_en || tripInfo?.destination_city_ar || ''} was rejected.`,
          data: { booking_id: id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
