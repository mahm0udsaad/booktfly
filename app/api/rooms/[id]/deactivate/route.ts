import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!provider || provider.status !== 'active') {
      return NextResponse.json(
        { data: null, error: 'Provider account is not active' },
        { status: 403 }
      )
    }

    const { data: existingRoom } = await supabaseAdmin
      .from('rooms')
      .select('id, status, provider_id')
      .eq('id', id)
      .eq('provider_id', provider.id)
      .single()

    if (!existingRoom) {
      return NextResponse.json(
        { data: null, error: 'Room not found' },
        { status: 404 }
      )
    }

    if (existingRoom.status !== 'active' && existingRoom.status !== 'deactivated') {
      return NextResponse.json(
        {
          data: null,
          error: `Cannot toggle room with status '${existingRoom.status}'`,
        },
        { status: 400 }
      )
    }

    const newStatus =
      existingRoom.status === 'active' ? 'deactivated' : 'active'

    const { data: updatedRoom, error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to toggle room status:', updateError)
      return NextResponse.json(
        { data: null, error: 'Failed to update room status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updatedRoom, error: null })
  } catch (error) {
    console.error('Room deactivate error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
