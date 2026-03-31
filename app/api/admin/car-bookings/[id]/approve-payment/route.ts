import { after, NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'
import { logActivity } from '@/lib/activity-log'
import { shortId } from '@/lib/utils'
import { handleBookingConfirmedRewards } from '@/lib/points'
import { render } from '@react-email/components'
import PaymentReceipt from '@/emails/payment-receipt'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { action, reason } = body as { action: 'approve' | 'reject'; reason?: string }

    const { data: booking } = await supabaseAdmin
      .from('car_bookings')
      .select('*, car:cars(brand_ar, brand_en, model_ar, model_en, city_ar, city_en), provider:providers(user_id)')
      .eq('id', id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Car booking not found' }, { status: 404 })
    if (booking.status !== 'payment_processing') {
      return NextResponse.json({ error: 'Booking is not awaiting payment' }, { status: 400 })
    }

    const ref = shortId(id)
    const carInfo = booking.car as any

    if (action === 'approve') {
      await supabaseAdmin
        .from('car_bookings')
        .update({
          status: 'confirmed',
          paid_at: new Date().toISOString(),
          payment_reviewed_by: user.id,
          payment_reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      await supabaseAdmin.rpc('credit_wallet', {
        p_provider_id: booking.provider_id,
        p_amount: booking.provider_payout,
        p_booking_id: id,
        p_desc_ar: `إيراد حجز سيارة رقم ${ref}`,
        p_desc_en: `Revenue from car booking #${ref}`,
      })

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'car_booking_confirmed',
          titleAr: 'تم تأكيد الدفع وتأكيد حجزك',
          titleEn: 'Payment confirmed, car booking confirmed',
          bodyAr: `تم تأكيد حجز السيارة رقم ${ref} - ${carInfo?.brand_ar || ''} ${carInfo?.model_ar || ''}`,
          bodyEn: `Your car booking #${ref} for ${carInfo?.brand_en || carInfo?.brand_ar || ''} ${carInfo?.model_en || carInfo?.model_ar || ''} has been confirmed.`,
          data: { car_booking_id: id },
        })
      }

      const providerUserId = (booking.provider as any)?.user_id
      if (providerUserId) {
        await notify({
          userId: providerUserId,
          type: 'new_car_booking',
          titleAr: 'لديك حجز سيارة جديد مؤكد',
          titleEn: 'You have a new confirmed car booking',
          bodyAr: `حجز سيارة جديد رقم ${ref} - ${booking.number_of_days} أيام - تم إيداع ${booking.provider_payout} في محفظتك`,
          bodyEn: `New car booking #${ref} - ${booking.number_of_days} day(s) - ${booking.provider_payout} credited to your wallet`,
          data: { car_booking_id: id },
        })
      }

      logActivity('car_booking_confirmed', { metadata: { bookingId: id } })

      // Send receipt email & award points (off critical path)
      if (booking.buyer_id) {
        after(async () => {
          try {
            const carName = `${carInfo?.brand_en || carInfo?.brand_ar || ''} ${carInfo?.model_en || carInfo?.model_ar || ''}`
            const carCity = carInfo?.city_en || carInfo?.city_ar || ''
            const receiptHtml = await render(PaymentReceipt({
              bookingRef: ref,
              type: 'car',
              origin: carName,
              destination: carCity,
              departureDate: booking.pickup_date || '',
              carBrand: carName,
              days: booking.number_of_days,
              totalAmount: booking.total_amount,
              commissionFree: booking.total_amount,
              passengerName: booking.guest_name || 'Guest',
              locale: 'en',
            }))
            await notify({
              userId: booking.buyer_id!,
              type: 'car_booking_confirmed',
              titleAr: 'إيصال الدفع',
              titleEn: 'Payment Receipt',
              bodyAr: `إيصال الدفع لحجز السيارة رقم ${ref}`,
              bodyEn: `Payment receipt for car booking #${ref}`,
              data: { car_booking_id: id },
              email: {
                subject: `Payment Receipt - ${ref}`,
                html: receiptHtml,
              },
            })

            await handleBookingConfirmedRewards({
              buyerId: booking.buyer_id!,
              bookingId: id,
              totalAmount: booking.total_amount,
              type: 'car',
              refLabel: `#${ref}`,
            })
          } catch (err) {
            console.error('Car booking rewards/receipt error:', err)
          }
        })
      }
    } else {
      await supabaseAdmin
        .from('car_bookings')
        .update({
          status: 'payment_failed',
          payment_reviewed_by: user.id,
          payment_reviewed_at: new Date().toISOString(),
          payment_rejection_reason: reason || null,
        })
        .eq('id', id)

      if (booking.buyer_id) {
        await notify({
          userId: booking.buyer_id,
          type: 'payment_rejected',
          titleAr: 'تم رفض التحويل البنكي',
          titleEn: 'Bank transfer rejected',
          bodyAr: `تم رفض التحويل البنكي لحجز السيارة رقم ${ref}${reason ? `. السبب: ${reason}` : ''}`,
          bodyEn: `Bank transfer for car booking #${ref} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
          data: { car_booking_id: id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve car payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
