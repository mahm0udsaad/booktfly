import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) return NextResponse.json({ error: 'Not a provider' }, { status: 403 })

    const { data: wallet } = await supabaseAdmin
      .from('provider_wallets')
      .select('*')
      .eq('provider_id', provider.id)
      .single()

    const { data: transactions } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      balance: wallet?.balance || 0,
      transactions: transactions || [],
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
