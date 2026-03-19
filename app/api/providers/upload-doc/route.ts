import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 20, windowMs: 60_000 })
    if (limited) return limited

    const isAr = request.headers.get('accept-language')?.startsWith('ar')

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: isAr ? 'يرجى تسجيل الدخول' : 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const field = formData.get('field') as string | null

    if (!file || !field) {
      return NextResponse.json(
        { data: null, error: isAr ? 'الملف أو اسم الحقل مفقود' : 'Missing file or field name' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { data: null, error: isAr ? 'نوع الملف غير مدعوم. المسموح: PDF و JPG و PNG.' : 'Unsupported file type. Allowed: PDF, JPG, PNG.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { data: null, error: isAr ? 'حجم الملف كبير جدا. الحد الأقصى 4 ميجابايت.' : 'File too large. Maximum 4 MB.' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() || 'pdf'
    const filePath = `${user.id}/applications/${field}_${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from('provider-documents')
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Document upload error:', uploadError)
      return NextResponse.json(
        { data: null, error: isAr ? 'فشل في رفع المستند' : 'Failed to upload document' },
        { status: 500 }
      )
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('provider-documents')
      .getPublicUrl(filePath)

    return NextResponse.json({
      data: { field: `${field}_url`, url: urlData.publicUrl },
      error: null,
    })
  } catch (error) {
    console.error('Upload doc error:', error)
    const isAr = request.headers.get('accept-language')?.startsWith('ar')
    return NextResponse.json(
      { data: null, error: isAr ? 'خطأ في الخادم' : 'Internal server error' },
      { status: 500 }
    )
  }
}
