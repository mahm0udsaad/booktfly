import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('room_bookings')
      .select('*, room:rooms(name_ar, name_en, city_ar, city_en)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Room booking not found' }, { status: 404 })
    }

    if (booking.status === 'refunded') {
      return NextResponse.json({ error: 'Booking is already refunded' }, { status: 400 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be refunded' }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('room_bookings')
      .update({
        status: 'refunded',
        refunded_by: user.id,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to refund room booking' }, { status: 500 })
    }

    try {
      const ref = booking.id.slice(0, 8)
      await supabaseAdmin.rpc('debit_wallet', {
        p_provider_id: booking.provider_id,
        p_amount: booking.provider_payout,
        p_booking_id: booking.id,
        p_type: 'debit',
        p_desc_ar: `استرداد حجز غرفة رقم ${ref}`,
        p_desc_en: `Refund for room booking #${ref}`,
      })
    } catch (walletErr) {
      console.error('Failed to debit wallet:', walletErr)
    }

    const roomInfo = booking.room as { name_ar: string; name_en: string | null; city_ar: string; city_en: string | null } | null
    await notify({
      userId: booking.buyer_id,
      type: 'room_booking_refunded',
      titleAr: 'تم استرداد حجز الغرفة',
      titleEn: 'Room Booking Refunded',
      bodyAr: `تم استرداد مبلغ ${booking.total_amount} ر.س لحجز الغرفة "${roomInfo?.name_ar || ''}"`,
      bodyEn: `Your room booking for "${roomInfo?.name_en || roomInfo?.name_ar || ''}" has been refunded. Amount: ${booking.total_amount} SAR`,
      data: { room_booking_id: booking.id },
      email: {
        subject: 'Room Booking Refunded - BooktFly',
        html: `<p>Your room booking has been refunded.</p><p><strong>Amount:</strong> ${booking.total_amount} SAR</p><p>The refund will be processed to your original payment method.</p>`,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
