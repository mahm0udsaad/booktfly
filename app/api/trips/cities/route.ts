import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data: origins } = await supabaseAdmin
    .from('trips')
    .select('origin_city_ar, origin_city_en, origin_code')
    .eq('status', 'active')

  const { data: destinations } = await supabaseAdmin
    .from('trips')
    .select('destination_city_ar, destination_city_en, destination_code')
    .eq('status', 'active')

  const cityMap = new Map<string, { ar: string; en: string; code: string }>()

  for (const row of origins || []) {
    if (row.origin_code && !cityMap.has(row.origin_code)) {
      cityMap.set(row.origin_code, {
        ar: row.origin_city_ar,
        en: row.origin_city_en || row.origin_city_ar,
        code: row.origin_code,
      })
    }
  }

  for (const row of destinations || []) {
    if (row.destination_code && !cityMap.has(row.destination_code)) {
      cityMap.set(row.destination_code, {
        ar: row.destination_city_ar,
        en: row.destination_city_en || row.destination_city_ar,
        code: row.destination_code,
      })
    }
  }

  const cities = Array.from(cityMap.values()).sort((a, b) =>
    a.en.localeCompare(b.en)
  )

  return NextResponse.json({ cities }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
