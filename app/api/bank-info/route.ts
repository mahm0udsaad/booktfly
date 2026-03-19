import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('platform_settings')
      .select('bank_name_ar, bank_name_en, bank_iban, bank_account_holder_ar, bank_account_holder_en')
      .limit(1)
      .single()

    if (!data) {
      return NextResponse.json({ error: 'Bank info not configured' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
