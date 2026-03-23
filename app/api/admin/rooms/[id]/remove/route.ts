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

    const { data: room, error: fetchError } = await supabaseAdmin
      .from('rooms')
      .select('*, providers:provider_id(user_id, company_name_ar)')
      .eq('id', id)
      .single()

    if (fetchError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status === 'removed') {
      return NextResponse.json({ error: 'Room is already removed' }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({
        status: 'removed',
        removed_reason: reason,
        removed_by: user.id,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to remove room' }, { status: 500 })
    }

    const providerUserId = (room.providers as { user_id: string })?.user_id
    if (providerUserId) {
      await notify({
        userId: providerUserId,
        type: 'room_removed',
        titleAr: 'تم حذف غرفة',
        titleEn: 'Room Removed',
        bodyAr: `تم حذف غرفتك "${room.name_ar}". السبب: ${reason}`,
        bodyEn: `Your room "${room.name_en || room.name_ar}" has been removed. Reason: ${reason}`,
        data: { room_id: room.id },
        email: {
          subject: 'Room Removed - BooktFly',
          html: `<p>Your room <strong>${room.name_ar}</strong> has been removed by an administrator.</p><p><strong>Reason:</strong> ${reason}</p>`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
