import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'
import { shortId } from '@/lib/utils'

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

    const { data: provider } = await supabase
      .from('providers')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('room_bookings')
      .select('*, room:rooms(*)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.provider_id !== provider.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only confirmed bookings can be rejected' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('room_bookings')
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

    const ref = shortId(id)
    const roomNameAr = booking.room?.name_ar || ''
    const roomNameEn = booking.room?.name_en || roomNameAr
    const cityAr = booking.room?.city_ar || ''
    const cityEn = booking.room?.city_en || cityAr

    if (booking.buyer_id) {
      await notify({
        userId: booking.buyer_id,
        type: 'room_booking_rejected',
        titleAr: 'تم رفض حجز الغرفة',
        titleEn: 'Your room booking has been rejected',
        bodyAr: `تم رفض حجزك رقم ${ref} للغرفة "${roomNameAr}" في ${cityAr}.${reason ? ` السبب: ${reason}` : ''}`,
        bodyEn: `Your booking #${ref} for room "${roomNameEn}" in ${cityEn} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        data: { room_booking_id: id },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
