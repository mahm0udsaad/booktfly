import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status')
    const provider_id = searchParams.get('provider_id')
    const category = searchParams.get('category')

    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('rooms')
      .select(
        '*, provider:providers(company_name_ar, company_name_en)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (provider_id) {
      query = query.eq('provider_id', provider_id)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: rooms, count, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }

    return NextResponse.json({
      rooms: rooms || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
