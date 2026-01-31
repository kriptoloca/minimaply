import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Cookie'den authenticated user al
async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Service role client
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Admin rolü doğrula
async function verifyAdminRole(userId: string): Promise<boolean> {
  const supabase = getServiceClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return profile?.role === 'admin'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1) Cookie'den user al - BODY'DEN ASLA ALMA
    const { user, error: authError } = await getAuthenticatedUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      )
    }

    // 2) Admin rolü doğrula
    const isAdmin = await verifyAdminRole(user.id)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      )
    }

    // 3) Body'den sadece işlem verilerini al (admin_id YOK!)
    const body = await request.json()
    const { status, admin_notes } = body
    const { id: reportId } = await params

    if (!status || !['reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum belirtin.' },
        { status: 400 }
      )
    }

    // 4) Service client ile DB işlemleri
    const supabase = getServiceClient()

    const { data: report, error } = await supabase
      .from('event_reports')
      .update({
        status,
        admin_notes,
        reviewed_by: user.id, // Cookie'den - güvenli!
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      console.error('Report update error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası.' },
        { status: 500 }
      )
    }

    // 5) Admin audit log
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id, // Cookie'den - güvenli!
        action: `report_${status}`,
        entity_type: 'event_report',
        entity_id: reportId,
        details: { admin_notes }
      })

    return NextResponse.json({ success: true, report })

  } catch (error) {
    console.error('Admin reports API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
