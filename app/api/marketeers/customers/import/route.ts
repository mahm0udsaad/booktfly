import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: 'File must have a header row and at least one data row' }, { status: 400 })
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const nameIdx = headers.indexOf('name')
  const emailIdx = headers.indexOf('email')
  const phoneIdx = headers.indexOf('phone')

  let imported = 0
  let errors = 0

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const name = nameIdx >= 0 ? cols[nameIdx] || null : null
    const email = emailIdx >= 0 ? cols[emailIdx] || null : null
    const phone = phoneIdx >= 0 ? cols[phoneIdx] || null : null

    if (!name && !email) {
      errors++
      return null
    }

    return {
      marketeer_id: marketeer.id,
      name,
      email,
      phone,
      source: 'excel' as const,
    }
  }).filter(Boolean)

  if (rows.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('marketeer_customers')
      .insert(rows as any[])
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    imported = data?.length || 0
  }

  return NextResponse.json({ imported, errors })
}
