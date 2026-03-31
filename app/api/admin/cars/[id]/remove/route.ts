import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'

export async function PATCH(
  request: Request,
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
    const body = await request.json()
    const { reason } = body as { reason: string }

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Removal reason is required' }, { status: 400 })
    }

    const { data: car, error: fetchError } = await supabaseAdmin
      .from('cars')
      .select('*, providers:provider_id(user_id, company_name_ar)')
      .eq('id', id)
      .single()

    if (fetchError || !car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    if (car.status === 'removed') {
      return NextResponse.json({ error: 'Car is already removed' }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('cars')
      .update({
        status: 'removed',
        removed_reason: reason,
        removed_by: user.id,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to remove car' }, { status: 500 })
    }

    const providerUserId = (car.providers as { user_id: string })?.user_id
    if (providerUserId) {
      await notify({
        userId: providerUserId,
        type: 'car_removed',
        titleAr: 'تم حذف سيارة',
        titleEn: 'Car Removed',
        bodyAr: `تم حذف سيارتك "${car.brand_ar} ${car.model_ar}". السبب: ${reason}`,
        bodyEn: `Your car "${car.brand_en || car.brand_ar} ${car.model_en || car.model_ar}" has been removed. Reason: ${reason}`,
        data: { car_id: car.id },
        email: {
          subject: 'Car Removed - BooktFly',
          html: `<p>Your car <strong>${car.brand_ar} ${car.model_ar}</strong> has been removed by an administrator.</p><p><strong>Reason:</strong> ${reason}</p>`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
