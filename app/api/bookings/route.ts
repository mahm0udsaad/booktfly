import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { bookingSchema } from '@/lib/validations'
import { DEFAULT_COMMISSION_RATE } from '@/lib/constants'
import { rateLimit } from '@/lib/rate-limit'
import { notify } from '@/lib/notifications'
import { shortId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const supabase = await createClient()

    // Auth is optional - guests can book
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { trip_id, seats_count, passengers } = parsed.data
    const firstPassenger = passengers[0]
    const passenger_name = `${firstPassenger.first_name} ${firstPassenger.last_name}`
    const passenger_phone = firstPassenger.phone
    const passenger_email = firstPassenger.email

    // Fetch trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*, provider:providers(*)')
      .eq('id', trip_id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    if (trip.status !== 'active') {
      return NextResponse.json(
        { error: 'Trip is not available for booking' },
        { status: 400 }
      )
    }

    const remaining = trip.total_seats - trip.booked_seats
    if (seats_count > remaining) {
      return NextResponse.json(
        { error: 'Not enough seats available' },
        { status: 400 }
      )
    }

    // Book seats via RPC
    const { error: rpcError } = await supabase.rpc('book_seats', {
      p_trip_id: trip_id,
      p_seats: seats_count,
    })

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to reserve seats. Please try again.' },
        { status: 400 }
      )
    }

    // Calculate commission
    let commissionRate = DEFAULT_COMMISSION_RATE

    if (trip.provider?.commission_rate != null) {
      commissionRate = trip.provider.commission_rate
    } else {
      // Fetch platform default
      const { data: settings } = await supabaseAdmin
        .from('platform_settings')
        .select('default_commission_rate')
        .limit(1)
        .single()

      if (settings?.default_commission_rate != null) {
        commissionRate = settings.default_commission_rate
      }
    }

    const totalAmount = trip.price_per_seat * seats_count
    const commissionAmount = (totalAmount * commissionRate) / 100
    const providerPayout = totalAmount - commissionAmount

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        trip_id,
        buyer_id: user?.id || null,
        provider_id: trip.provider_id,
        passenger_name,
        passenger_phone,
        passenger_email,
        passenger_id_number: firstPassenger.id_number || null,
        passengers: passengers || null,
        seats_count,
        price_per_seat: trip.price_per_seat,
        total_amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        provider_payout: providerPayout,
        status: 'confirmed',
        paid_at: new Date().toISOString(),
        moyasar_payment_id: `dummy_${Date.now()}`,
      })
      .select('*, trip:trips(*), provider:providers(*)')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send notifications
    const ref = shortId(booking.id)
    const tripOrigin = trip.origin_city_ar || ''
    const tripDest = trip.destination_city_ar || ''
    const tripOriginEn = trip.origin_city_en || tripOrigin
    const tripDestEn = trip.destination_city_en || tripDest

    if (user?.id) {
      await notify({
        userId: user.id,
        type: 'booking_confirmed',
        titleAr: 'تم تأكيد حجزك بنجاح',
        titleEn: 'Your booking has been confirmed',
        bodyAr: `تم تأكيد حجزك رقم ${ref} للرحلة من ${tripOrigin} إلى ${tripDest}`,
        bodyEn: `Your booking #${ref} for the trip from ${tripOriginEn} to ${tripDestEn} has been confirmed.`,
        data: { booking_id: booking.id },
      })
    }

    if (trip.provider?.user_id) {
      await notify({
        userId: trip.provider.user_id,
        type: 'new_booking',
        titleAr: 'لديك حجز جديد',
        titleEn: 'You have a new booking',
        bodyAr: `تم استلام حجز جديد رقم ${ref} للرحلة من ${tripOrigin} إلى ${tripDest} - ${seats_count} مقاعد`,
        bodyEn: `New booking #${ref} received for the trip from ${tripOriginEn} to ${tripDestEn} - ${seats_count} seat(s).`,
        data: { booking_id: booking.id },
      })
    }

    return NextResponse.json({ bookingId: booking.id }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
