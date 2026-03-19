import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/notifications'
import { shortId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Buyer confirms they have made the bank transfer
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
      .from('bookings')
      .select('*, trip:trips(origin_city_ar, origin_city_en, destination_city_ar, destination_city_en)')
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

    // Parse optional receipt URL from body
    let receiptUrl = booking.transfer_receipt_url
    try {
      const body = await request.json()
      if (body.transfer_receipt_url) {
        receiptUrl = body.transfer_receipt_url
      }
    } catch {
      // No body or invalid JSON is fine
    }

    // Mark transfer as confirmed by user (still needs admin approval)
    await supabaseAdmin
      .from('bookings')
      .update({
        transfer_confirmed_at: new Date().toISOString(),
        transfer_receipt_url: receiptUrl,
      })
      .eq('id', id)

    // Notify admin to review payment
    const ref = shortId(id)
    const tripInfo = booking.trip as any
    await notifyAdmin({
      type: 'payment_approved',
      titleAr: 'تحويل بنكي بانتظار المراجعة',
      titleEn: 'Bank transfer pending review',
      bodyAr: `الحجز رقم ${ref} - تم تأكيد التحويل البنكي ويحتاج مراجعة`,
      bodyEn: `Booking #${ref} - Bank transfer confirmed, needs review`,
      data: { booking_id: id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
