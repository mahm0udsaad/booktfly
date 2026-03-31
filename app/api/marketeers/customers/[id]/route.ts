import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { data: customer } = await supabaseAdmin
    .from('marketeer_customers')
    .select('id')
    .eq('id', id)
    .eq('marketeer_id', marketeer.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('marketeer_customers')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
