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
      .from('car_bookings')
      .select('*, car:cars(brand_ar, brand_en, model_ar, model_en, city_ar, city_en)')
      .eq('id', id)
      .eq('buyer_id', user.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be cancelled' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('car_bookings')
      .update({ status: 'cancellation_pending', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to submit cancellation request' }, { status: 500 })
    }

    const carInfo = booking.car as any
    const ref = shortId(booking.id)
    const carNameAr = `${carInfo?.brand_ar || ''} ${carInfo?.model_ar || ''}`
    const carNameEn = `${carInfo?.brand_en || carInfo?.brand_ar || ''} ${carInfo?.model_en || carInfo?.model_ar || ''}`

    await notifyAdmin({
      type: 'cancellation_requested',
      titleAr: 'طلب إلغاء حجز سيارة',
      titleEn: 'Car Booking Cancellation Request',
      bodyAr: `طلب إلغاء حجز السيارة رقم ${ref} - "${carNameAr}" في ${carInfo?.city_ar || ''}`,
      bodyEn: `Cancellation request for car booking #${ref} - "${carNameEn}" in ${carInfo?.city_en || carInfo?.city_ar || ''}`,
      data: { car_booking_id: id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
