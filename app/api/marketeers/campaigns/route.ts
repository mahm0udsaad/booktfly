import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { render } from '@react-email/components'
import LastMinuteDeal from '@/emails/last-minute-deal'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
  const {
    subject,
    listingType,
    title,
    subtitle,
    departureOrDate,
    originalPrice,
    discountedPrice,
    discountPercent,
    hoursLeft,
    bookingUrl,
    locale = 'ar',
  } = body

  if (!subject || !title || !bookingUrl) {
    return NextResponse.json({ error: 'Subject, title, and bookingUrl are required' }, { status: 400 })
  }

  const { data: customers } = await supabaseAdmin
    .from('marketeer_customers')
    .select('email, name')
    .eq('marketeer_id', marketeer.id)
    .not('email', 'is', null)

  if (!customers || customers.length === 0) {
    return NextResponse.json({ error: 'No customers with email addresses' }, { status: 400 })
  }

  const html = await render(
    LastMinuteDeal({
      listingType: listingType || 'flight',
      title,
      subtitle: subtitle || '',
      departureOrDate: departureOrDate || '',
      originalPrice: originalPrice || 0,
      discountedPrice: discountedPrice || 0,
      discountPercent: discountPercent || 0,
      hoursLeft: hoursLeft || 24,
      bookingUrl,
      locale,
    })
  )

  let sent = 0
  let failed = 0

  const batches: typeof customers[] = []
  for (let i = 0; i < customers.length; i += 50) {
    batches.push(customers.slice(i, i + 50))
  }

  for (const batch of batches) {
    const promises = batch.map(async (customer) => {
      if (!customer.email) return
      try {
        await resend.emails.send({
          from: 'BooktFly <noreply@booktfly.com>',
          to: customer.email,
          subject,
          html,
        })
        sent++
      } catch {
        failed++
      }
    })
    await Promise.all(promises)
  }

  return NextResponse.json({ sent, failed, total: customers.length })
}
