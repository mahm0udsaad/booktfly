import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 30, windowMs: 60_000 })
    if (limited) return limited

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*, provider:providers(*)')
      .eq('status', 'active')
      .or(`city_ar.ilike.%${city}%,city_en.ilike.%${city}%`)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rooms: rooms || [] })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
