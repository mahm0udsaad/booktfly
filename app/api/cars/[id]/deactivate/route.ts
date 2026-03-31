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

    const { data: existingCar } = await supabaseAdmin
      .from('cars')
      .select('id, status, provider_id')
      .eq('id', id)
      .eq('provider_id', provider.id)
      .single()

    if (!existingCar) {
      return NextResponse.json(
        { data: null, error: 'Car not found' },
        { status: 404 }
      )
    }

    if (existingCar.status !== 'active' && existingCar.status !== 'deactivated') {
      return NextResponse.json(
        {
          data: null,
          error: `Cannot toggle car with status '${existingCar.status}'`,
        },
        { status: 400 }
      )
    }

    const newStatus =
      existingCar.status === 'active' ? 'deactivated' : 'active'

    const { data: updatedCar, error: updateError } = await supabaseAdmin
      .from('cars')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to toggle car status:', updateError)
      return NextResponse.json(
        { data: null, error: 'Failed to update car status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updatedCar, error: null })
  } catch (error) {
    console.error('Car deactivate error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
