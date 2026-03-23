import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { roomBookingSchema } from '@/lib/validations'
import { DEFAULT_COMMISSION_RATE } from '@/lib/constants'
import { rateLimit } from '@/lib/rate-limit'
import { notify } from '@/lib/notifications'
import { shortId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const parsed = roomBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      room_id,
      guest_name,
      guest_phone,
      guest_email,
      check_in_date,
      number_of_days,
      number_of_people,
      rooms_count,
    } = parsed.data

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, provider:providers(*)')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room.status !== 'active') {
      return NextResponse.json(
        { error: 'Room is not available for booking' },
        { status: 400 }
      )
    }

    if (!room.instant_book) {
      const checkIn = new Date(check_in_date)
      if (room.available_from && checkIn < new Date(room.available_from)) {
        return NextResponse.json(
          { error: 'Check-in date is before the available period' },
          { status: 400 }
        )
      }
      if (room.available_to && checkIn > new Date(room.available_to)) {
        return NextResponse.json(
          { error: 'Check-in date is after the available period' },
          { status: 400 }
        )
      }
    }

    const totalAmount = room.price_per_night * number_of_days * rooms_count

    let commissionRate = DEFAULT_COMMISSION_RATE

    if (room.provider?.commission_rate != null) {
      commissionRate = room.provider.commission_rate
    } else {
      const { data: settings } = await supabaseAdmin
        .from('platform_settings')
        .select('default_commission_rate')
        .limit(1)
        .single()

      if (settings?.default_commission_rate != null) {
        commissionRate = settings.default_commission_rate
      }
    }

    const commissionAmount = (totalAmount * commissionRate) / 100
    const providerPayout = totalAmount - commissionAmount

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('room_bookings')
      .insert({
        room_id,
        buyer_id: user?.id || null,
        provider_id: room.provider_id,
        guest_name,
        guest_phone,
        guest_email,
        check_in_date,
        number_of_days,
        number_of_people,
        rooms_count,
        price_per_night: room.price_per_night,
        total_amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        provider_payout: providerPayout,
        status: 'payment_processing',
      })
      .select('*, room:rooms(*), provider:providers(*)')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    const ref = shortId(booking.id)
    const roomNameAr = room.name_ar || ''
    const roomNameEn = room.name_en || roomNameAr
    const city = room.city_ar || room.city_en || ''
    const cityEn = room.city_en || city

    if (user?.id) {
      await notify({
        userId: user.id,
        type: 'new_room_booking',
        titleAr: 'تم إنشاء حجزك بنجاح',
        titleEn: 'Your room booking has been created',
        bodyAr: `تم إنشاء حجزك رقم ${ref} للغرفة "${roomNameAr}" في ${city}. يرجى إتمام الدفع.`,
        bodyEn: `Your booking #${ref} for room "${roomNameEn}" in ${cityEn} has been created. Please complete payment.`,
        data: { room_booking_id: booking.id },
      })
    }

    if (room.provider?.user_id) {
      await notify({
        userId: room.provider.user_id,
        type: 'new_room_booking',
        titleAr: 'لديك حجز غرفة جديد',
        titleEn: 'You have a new room booking',
        bodyAr: `تم استلام حجز جديد رقم ${ref} للغرفة "${roomNameAr}" في ${city} - ${rooms_count} غرف، ${number_of_days} ليالي`,
        bodyEn: `New booking #${ref} received for room "${roomNameEn}" in ${cityEn} - ${rooms_count} room(s), ${number_of_days} night(s).`,
        data: { room_booking_id: booking.id },
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
