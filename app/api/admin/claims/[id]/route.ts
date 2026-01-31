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
    const { id: claimId } = await params

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum belirtin (approved/rejected).' },
        { status: 400 }
      )
    }

    // 4) Service client ile DB işlemleri
    const supabase = getServiceClient()

    // Claim'i güncelle - admin_id cookie'den geliyor!
    const { data: claim, error: claimError } = await supabase
      .from('provider_claims')
      .update({
        status,
        admin_notes,
        reviewed_by: user.id, // Cookie'den - güvenli!
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select('*, event:events(*)')
      .single()

    if (claimError) {
      console.error('Claim update error:', claimError)
      return NextResponse.json(
        { error: 'Veritabanı hatası.' },
        { status: 500 }
      )
    }

    // 5) Eğer onaylandıysa
    if (status === 'approved') {
      // Provider oluştur veya güncelle
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .upsert({
          user_id: claim.user_id,
          business_name: claim.business_name,
          contact_email: claim.contact_email,
          contact_phone: claim.contact_phone,
          website_url: claim.website_url,
          instagram_url: claim.instagram_url,
          google_maps_url: claim.google_maps_url,
          status: 'active'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (!providerError && provider) {
        // Event'i provider'a bağla
        await supabase
          .from('events')
          .update({
            provider_id: provider.id,
            claim_status: 'claimed'
          })
          .eq('id', claim.event_id)

        // User'ın rolünü provider yap
        await supabase
          .from('profiles')
          .update({ role: 'provider' })
          .eq('id', claim.user_id)
      }
    } else {
      // Reddedildiyse event'in claim_status'unu temizle
      await supabase
        .from('events')
        .update({ claim_status: null })
        .eq('id', claim.event_id)
    }

    // 6) Admin audit log
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id, // Cookie'den - güvenli!
        action: status === 'approved' ? 'claim_approved' : 'claim_rejected',
        entity_type: 'provider_claim',
        entity_id: claimId,
        details: { admin_notes }
      })

    return NextResponse.json({ success: true, claim })

  } catch (error) {
    console.error('Admin claims API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
