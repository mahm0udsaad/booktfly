import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notify } from '@/lib/notifications'

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
    const { action, comment } = body as { action: 'approve' | 'reject'; comment?: string }

    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*, provider:providers(user_id, company_name_ar)')
      .eq('id', id)
      .single()

    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (withdrawal.status !== 'pending') return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })

    const providerUserId = (withdrawal.provider as any)?.user_id

    if (action === 'approve') {
      // Debit wallet
      try {
        await supabaseAdmin.rpc('debit_wallet', {
          p_provider_id: withdrawal.provider_id,
          p_amount: withdrawal.amount,
          p_type: 'withdrawal',
          p_desc_ar: `سحب مبلغ ${withdrawal.amount}`,
          p_desc_en: `Withdrawal of ${withdrawal.amount}`,
        })
      } catch {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
      }

      await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_comment: comment || null,
        })
        .eq('id', id)

      if (providerUserId) {
        await notify({
          userId: providerUserId,
          type: 'withdrawal_approved',
          titleAr: 'تم الموافقة على طلب السحب',
          titleEn: 'Withdrawal request approved',
          bodyAr: `تم الموافقة على سحب مبلغ ${withdrawal.amount} وتحويله لحسابك`,
          bodyEn: `Your withdrawal request for ${withdrawal.amount} has been approved and processed.`,
          data: { withdrawal_id: id },
        })
      }
    } else {
      await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_comment: comment || null,
        })
        .eq('id', id)

      if (providerUserId) {
        await notify({
          userId: providerUserId,
          type: 'withdrawal_rejected',
          titleAr: 'تم رفض طلب السحب',
          titleEn: 'Withdrawal request rejected',
          bodyAr: `تم رفض طلب السحب${comment ? `. السبب: ${comment}` : ''}`,
          bodyEn: `Your withdrawal request was rejected.${comment ? ` Reason: ${comment}` : ''}`,
          data: { withdrawal_id: id },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Withdrawal review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
