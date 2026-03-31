import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: marketeer } = await supabase
    .from('marketeers')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!marketeer) return NextResponse.json({ error: 'Not a marketeer' }, { status: 403 })

  const { data: customers, error } = await supabaseAdmin
    .from('marketeer_customers')
    .select('*')
    .eq('marketeer_id', marketeer.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ customers })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: marketeer } = await supabase
    .from('marketeers')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!marketeer) return NextResponse.json({ error: 'Not a marketeer' }, { status: 403 })

  const body = await request.json()
  const { name, email, phone } = body

  if (!name && !email) {
    return NextResponse.json({ error: 'Name or email is required' }, { status: 400 })
  }

  const { data: customer, error } = await supabaseAdmin
    .from('marketeer_customers')
    .insert({
      marketeer_id: marketeer.id,
      name: name || null,
      email: email || null,
      phone: phone || null,
      source: 'manual',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ customer })
}
