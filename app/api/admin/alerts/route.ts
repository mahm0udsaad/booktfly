import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const filter = searchParams.get('filter') || 'active'
    const page = parseInt(searchParams.get('page') || '0', 10)
    const perPage = 20

    let query = supabaseAdmin
      .from('admin_alerts')
      .select('*', { count: 'exact' })

    if (filter === 'active') query = query.eq('dismissed', false)
    else if (filter === 'critical') query = query.eq('severity', 'critical')
    else if (filter === 'dismissed') query = query.eq('dismissed', true)

    query = query
      .order('created_at', { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1)

    const { data, count, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ alerts: data || [], total: count || 0 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { alertId, dismissed } = await request.json()

    if (!alertId) return NextResponse.json({ error: 'alertId is required' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('admin_alerts')
      .update({ dismissed: !!dismissed, dismissed_by: user.id, dismissed_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
