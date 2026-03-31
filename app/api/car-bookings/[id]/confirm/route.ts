import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/notifications'
import { shortId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, { limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: booking } = await supabaseAdmin
      .from('car_bookings')
      .select('*, car:cars(brand_ar, brand_en, model_ar, model_en, city_ar, city_en)')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.buyer_id && (!user || booking.buyer_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'payment_processing') {
      return NextResponse.json({ error: 'Booking cannot be confirmed in current status' }, { status: 400 })
    }

    let receiptUrl = booking.transfer_receipt_url
    try {
      const body = await request.json()
      if (body.transfer_receipt_url) {
        receiptUrl = body.transfer_receipt_url
      }
    } catch {
      // No body or invalid JSON is fine
    }

    await supabaseAdmin
      .from('car_bookings')
      .update({
        transfer_confirmed_at: new Date().toISOString(),
        transfer_receipt_url: receiptUrl,
      })
      .eq('id', id)

    const ref = shortId(id)

    await notifyAdmin({
      type: 'payment_approved',
      titleAr: 'تحويل سيارة بانتظار المراجعة',
      titleEn: 'Car transfer pending review',
      bodyAr: `حجز السيارة رقم ${ref} - تم تأكيد التحويل البنكي ويحتاج مراجعة`,
      bodyEn: `Car booking #${ref} - Bank transfer confirmed, needs review`,
      data: { car_booking_id: id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
