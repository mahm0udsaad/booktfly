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
      .from('car_bookings')
      .select('*, car:cars(brand_ar, brand_en, model_ar, model_en, city_ar, city_en)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Car booking not found' }, { status: 404 })
    }

    if (booking.status === 'refunded') {
      return NextResponse.json({ error: 'Booking is already refunded' }, { status: 400 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be refunded' }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('car_bookings')
      .update({
        status: 'refunded',
        refunded_by: user.id,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to refund car booking' }, { status: 500 })
    }

    try {
      const ref = booking.id.slice(0, 8)
      await supabaseAdmin.rpc('debit_wallet', {
        p_provider_id: booking.provider_id,
        p_amount: booking.provider_payout,
        p_booking_id: booking.id,
        p_type: 'debit',
        p_desc_ar: `استرداد حجز سيارة رقم ${ref}`,
        p_desc_en: `Refund for car booking #${ref}`,
      })
    } catch (walletErr) {
      console.error('Failed to debit wallet:', walletErr)
    }

    const carInfo = booking.car as { brand_ar: string; brand_en: string | null; model_ar: string; model_en: string | null } | null
    const carNameAr = carInfo ? `${carInfo.brand_ar} ${carInfo.model_ar}` : ''
    const carNameEn = carInfo ? `${carInfo.brand_en || carInfo.brand_ar} ${carInfo.model_en || carInfo.model_ar}` : ''

    if (booking.buyer_id) {
      await notify({
        userId: booking.buyer_id,
        type: 'car_booking_refunded',
        titleAr: 'تم استرداد حجز السيارة',
        titleEn: 'Car Booking Refunded',
        bodyAr: `تم استرداد مبلغ ${booking.total_amount} ر.س لحجز السيارة "${carNameAr}"`,
        bodyEn: `Your car booking for "${carNameEn}" has been refunded. Amount: ${booking.total_amount} SAR`,
        data: { car_booking_id: booking.id },
        email: {
          subject: 'Car Booking Refunded - BooktFly',
          html: `<p>Your car booking has been refunded.</p><p><strong>Amount:</strong> ${booking.total_amount} SAR</p><p>The refund will be processed to your original payment method.</p>`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
