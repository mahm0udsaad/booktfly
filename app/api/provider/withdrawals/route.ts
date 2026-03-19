import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/notifications'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single()
    if (!provider) return NextResponse.json({ error: 'Not a provider' }, { status: 403 })

    const { data } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ withdrawals: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase.from('providers').select('id, iban, company_name_ar').eq('user_id', user.id).single()
    if (!provider) return NextResponse.json({ error: 'Not a provider' }, { status: 403 })

    const body = await request.json()
    const { amount } = body as { amount: number }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!provider.iban) {
      return NextResponse.json({ error: 'Please add your IBAN in your profile first' }, { status: 400 })
    }

    // Check balance
    const { data: wallet } = await supabaseAdmin
      .from('provider_wallets')
      .select('balance')
      .eq('provider_id', provider.id)
      .single()

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Check for pending withdrawals
    const { count } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', provider.id)
      .eq('status', 'pending')

    if ((count || 0) > 0) {
      return NextResponse.json({ error: 'You already have a pending withdrawal request' }, { status: 400 })
    }

    const { data: withdrawal, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        provider_id: provider.id,
        amount,
        provider_iban: provider.iban,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 })
    }

    await notifyAdmin({
      type: 'withdrawal_requested',
      titleAr: 'طلب سحب جديد',
      titleEn: 'New Withdrawal Request',
      bodyAr: `طلب سحب بمبلغ ${amount} من ${provider.company_name_ar}`,
      bodyEn: `Withdrawal request for ${amount} from provider`,
      data: { withdrawal_id: withdrawal.id },
    })

    return NextResponse.json({ withdrawal }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
