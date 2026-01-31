import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin kontrolü
async function verifyAdmin(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') return null
  
  return user
}

// POST /api/admin/report - resolve veya dismiss
export async function POST(request: NextRequest) {
  try {
    // 1. Admin auth
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { report_id, action, note } = body

    // 2. Validasyon
    if (!report_id || !action) {
      return NextResponse.json(
        { error: 'report_id ve action zorunlu.' },
        { status: 400 }
      )
    }

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action. (resolve/dismiss)' },
        { status: 400 }
      )
    }

    // 3. Report'u çek
    const { data: report, error: reportError } = await supabaseAdmin
      .from('event_reports')
      .select('*, event:events(id, title)')
      .eq('id', report_id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report bulunamadı.' },
        { status: 404 }
      )
    }

    if (report.status !== 'open') {
      return NextResponse.json(
        { error: 'Bu report zaten işlenmiş.' },
        { status: 400 }
      )
    }

    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed'

    // 4. Report'u güncelle
    const { error: updateError } = await supabaseAdmin
      .from('event_reports')
      .update({
        status: newStatus,
        resolved_at: new Date().toISOString(),
        resolved_by: admin.id,
        resolution_note: note || null
      })
      .eq('id', report_id)

    if (updateError) {
      console.error('Report update error:', updateError)
      return NextResponse.json(
        { error: 'Güncelleme hatası.' },
        { status: 500 }
      )
    }

    // 5. Eğer resolved ise ve event'te needs_review varsa, kontrol et
    if (action === 'resolve') {
      // Bu event için başka open report var mı?
      const { count: openReports } = await supabaseAdmin
        .from('event_reports')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', report.event_id)
        .eq('status', 'open')

      // Hepsi çözüldüyse needs_review kaldır
      if (!openReports || openReports === 0) {
        await supabaseAdmin
          .from('events')
          .update({ needs_review: false })
          .eq('id', report.event_id)
      }
    }

    // 6. AUDIT LOG
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        admin_id: admin.id,
        action: `report_${action}`,
        target_type: 'event_report',
        target_id: report_id,
        details: {
          event_id: report.event_id,
          event_title: report.event?.title,
          report_type: report.report_type,
          note: note
        }
      })
      .single()

    return NextResponse.json({
      success: true,
      message: action === 'resolve' ? 'Report çözüldü.' : 'Report reddedildi.',
      status: newStatus
    })

  } catch (error) {
    console.error('Admin report API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
