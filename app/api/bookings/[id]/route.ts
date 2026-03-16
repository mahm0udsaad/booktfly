import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth is optional - guests can view their booking by ID
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, trip:trips(*, provider:providers(*)), provider:providers(*)')
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Authorization: guest bookings (no buyer_id) are accessible by booking ID
    // For authenticated bookings, check ownership/role
    if (booking.buyer_id) {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isOwner = booking.buyer_id === user.id
      const isProvider = booking.provider_id === user.id || booking.provider?.user_id === user.id
      const isAdmin = profile?.role === 'admin'

      if (!isOwner && !isProvider && !isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ booking })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
