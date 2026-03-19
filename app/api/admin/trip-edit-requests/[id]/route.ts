import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { action, comment } = body as { action: 'approve' | 'reject'; comment?: string }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: editRequest } = await supabaseAdmin
      .from('trip_edit_requests')
      .select('*, trip:trips(*, provider:providers(user_id, company_name_ar))')
      .eq('id', id)
      .single()

    if (!editRequest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (editRequest.status !== 'pending') return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })

    // Update edit request status
    await supabaseAdmin
      .from('trip_edit_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_comment: comment || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    const trip = editRequest.trip as any
    const providerUserId = trip?.provider?.user_id

    if (action === 'approve') {
      // Apply the changes to the trip
      const changes = editRequest.changes as Record<string, unknown>
      await supabaseAdmin
        .from('trips')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', editRequest.trip_id)

      // Notify provider
      if (providerUserId) {
        await notify({
          userId: providerUserId,
          type: 'trip_edit_approved',
          titleAr: 'تمت الموافقة على تعديل الرحلة',
          titleEn: 'Trip edit approved',
          bodyAr: `تمت الموافقة على تعديل رحلتك من ${trip.origin_city_ar} إلى ${trip.destination_city_ar}`,
          bodyEn: `Your edit request for the trip from ${trip.origin_city_en || trip.origin_city_ar} to ${trip.destination_city_en || trip.destination_city_ar} has been approved.`,
          data: { trip_id: editRequest.trip_id },
        })
      }

      // Notify all booked users about the trip update
      const { data: bookings } = await supabaseAdmin
        .from('bookings')
        .select('buyer_id')
        .eq('trip_id', editRequest.trip_id)
        .in('status', ['confirmed', 'payment_processing'])

      if (bookings) {
        const notifiedUsers = new Set<string>()
        for (const booking of bookings) {
          if (booking.buyer_id && !notifiedUsers.has(booking.buyer_id)) {
            notifiedUsers.add(booking.buyer_id)
            await notify({
              userId: booking.buyer_id,
              type: 'trip_updated',
              titleAr: 'تم تحديث رحلتك المحجوزة',
              titleEn: 'Your booked trip has been updated',
              bodyAr: `تم تحديث بيانات الرحلة من ${trip.origin_city_ar} إلى ${trip.destination_city_ar}. يرجى مراجعة التفاصيل.`,
              bodyEn: `The trip from ${trip.origin_city_en || trip.origin_city_ar} to ${trip.destination_city_en || trip.destination_city_ar} has been updated. Please review the details.`,
              data: { trip_id: editRequest.trip_id },
            })
          }
        }
      }
    } else {
      // Notify provider of rejection
      if (providerUserId) {
        await notify({
          userId: providerUserId,
          type: 'trip_edit_rejected',
          titleAr: 'تم رفض تعديل الرحلة',
          titleEn: 'Trip edit rejected',
          bodyAr: `تم رفض طلب تعديل رحلتك من ${trip.origin_city_ar} إلى ${trip.destination_city_ar}${comment ? `. السبب: ${comment}` : ''}`,
          bodyEn: `Your edit request for the trip from ${trip.origin_city_en || trip.origin_city_ar} to ${trip.destination_city_en || trip.destination_city_ar} was rejected.${comment ? ` Reason: ${comment}` : ''}`,
          data: { trip_id: editRequest.trip_id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Trip edit request review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
