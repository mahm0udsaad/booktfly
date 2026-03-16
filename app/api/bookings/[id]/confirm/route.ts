import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'
import { shortId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(_request, { limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const { id } = await params
    const supabase = await createClient()

    // Auth is optional - guests can confirm their booking
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*, trip:trips(*), provider:providers(*)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // If booking has a buyer_id, only that buyer can confirm
    if (booking.buyer_id && (!user || booking.buyer_id !== user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (booking.status !== 'payment_processing') {
      return NextResponse.json(
        { error: 'Booking cannot be confirmed in current status' },
        { status: 400 }
      )
    }

    // Update booking status to confirmed
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        paid_at: new Date().toISOString(),
        moyasar_payment_id: `dummy_${Date.now()}`,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to confirm booking' },
        { status: 500 }
      )
    }

    const ref = shortId(id)
    const tripOrigin = booking.trip?.origin_city_ar || ''
    const tripDest = booking.trip?.destination_city_ar || ''
    const tripOriginEn = booking.trip?.origin_city_en || tripOrigin
    const tripDestEn = booking.trip?.destination_city_en || tripDest

    // Notify buyer (only if authenticated user)
    if (booking.buyer_id) {
      await notify({
        userId: booking.buyer_id,
        type: 'booking_confirmed',
        titleAr: 'تم تأكيد حجزك بنجاح',
        titleEn: 'Your booking has been confirmed',
        bodyAr: `تم تأكيد حجزك رقم ${ref} للرحلة من ${tripOrigin} إلى ${tripDest}`,
        bodyEn: `Your booking #${ref} for the trip from ${tripOriginEn} to ${tripDestEn} has been confirmed.`,
        data: { booking_id: id },
      })
    }

    // Notify provider
    if (booking.provider?.user_id) {
      await notify({
        userId: booking.provider.user_id,
        type: 'new_booking',
        titleAr: 'لديك حجز جديد',
        titleEn: 'You have a new booking',
        bodyAr: `تم استلام حجز جديد رقم ${ref} للرحلة من ${tripOrigin} إلى ${tripDest} - ${booking.seats_count} مقاعد`,
        bodyEn: `New booking #${ref} received for the trip from ${tripOriginEn} to ${tripDestEn} - ${booking.seats_count} seat(s).`,
        data: { booking_id: id },
      })
    }

    return NextResponse.json({ success: true, bookingId: id })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
