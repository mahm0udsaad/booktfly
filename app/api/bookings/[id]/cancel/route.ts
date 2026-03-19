import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/notifications'
import { shortId } from '@/lib/utils'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, trips:trip_id(origin_city_ar, origin_city_en, destination_city_ar, destination_city_en)')
      .eq('id', id)
      .eq('buyer_id', user.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be cancelled' }, { status: 400 })
    }

    // Set to cancellation_pending
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancellation_pending', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to submit cancellation request' }, { status: 500 })
    }

    // Notify admin
    const tripInfo = booking.trips as any
    const ref = shortId(booking.id)
    await notifyAdmin({
      type: 'cancellation_requested',
      titleAr: 'طلب إلغاء حجز جديد',
      titleEn: 'New Cancellation Request',
      bodyAr: `طلب إلغاء الحجز رقم ${ref} للرحلة من ${tripInfo?.origin_city_ar || ''} إلى ${tripInfo?.destination_city_ar || ''}`,
      bodyEn: `Cancellation request for booking #${ref} - trip from ${tripInfo?.origin_city_en || tripInfo?.origin_city_ar || ''} to ${tripInfo?.destination_city_en || tripInfo?.destination_city_ar || ''}`,
      data: { booking_id: id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
