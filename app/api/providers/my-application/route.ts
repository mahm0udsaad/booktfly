import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        {
          status: 401,
          headers: NO_STORE_HEADERS,
        }
      )
    }

    // Fetch the latest application for this user
    const { data: application, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { data: null, error: 'No application found' },
        {
          status: 404,
          headers: NO_STORE_HEADERS,
        }
      )
    }

    return NextResponse.json(
      { data: application, error: null },
      {
        headers: NO_STORE_HEADERS,
      }
    )
  } catch (error) {
    console.error('My application error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      }
    )
  }
}
