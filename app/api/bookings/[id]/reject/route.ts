import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'
import { shortId, formatPrice } from '@/lib/utils'
import { render } from '@react-email/components'
import BookingRejected from '@/emails/booking-rejected'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const reason: string = body.reason || ''

    // Verify the user is a provider
    const { data: provider } = await supabase
      .from('providers')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the booking with trip info
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*, trip:trips(*)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the booking belongs to this provider
    if (booking.provider_id !== provider.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only confirmed bookings can be rejected' },
        { status: 400 }
      )
    }

    // Update booking status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'rejected',
        refunded_at: new Date().toISOString(),
        refunded_by: user.id,
        admin_notes: reason ? `Provider rejection: ${reason}` : 'Rejected by provider',
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 })
    }

    // Release seats back to the trip
    const { error: rpcError } = await supabaseAdmin.rpc('release_seats', {
      p_trip_id: booking.trip_id,
      p_seats: booking.seats_count,
    })

    if (rpcError) {
      console.error('Failed to release seats:', rpcError)
    }

    const ref = shortId(id)
    const tripOrigin = booking.trip?.origin_city_ar || ''
    const tripDest = booking.trip?.destination_city_ar || ''
    const tripOriginEn = booking.trip?.origin_city_en || tripOrigin
    const tripDestEn = booking.trip?.destination_city_en || tripDest

    // Render email
    const emailHtml = await render(
      BookingRejected({
        bookingRef: `BKT-${ref}`,
        origin: tripOriginEn,
        destination: tripDestEn,
        amount: booking.total_amount,
        reason: reason || undefined,
        locale: 'en',
      })
    )

    // Notify buyer
    await notify({
      userId: booking.buyer_id,
      type: 'booking_rejected',
      titleAr: 'تم رفض حجزك',
      titleEn: 'Your booking has been rejected',
      bodyAr: `تم رفض حجزك رقم ${ref} للرحلة من ${tripOrigin} إلى ${tripDest}. سيتم استرداد المبلغ ${formatPrice(booking.total_amount)}.${reason ? ` السبب: ${reason}` : ''}`,
      bodyEn: `Your booking #${ref} for the trip from ${tripOriginEn} to ${tripDestEn} has been rejected. A refund of ${booking.total_amount} SAR will be processed.${reason ? ` Reason: ${reason}` : ''}`,
      data: { booking_id: id },
      email: {
        subject: `Booking Rejected - BKT-${ref}`,
        html: emailHtml,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
