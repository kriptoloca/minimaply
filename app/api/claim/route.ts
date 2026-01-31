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
        setAll() {
          // Read-only için gerekli değil
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Service role client (RLS bypass - sadece güvenli işlemler için)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// IP adresini al
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    // 1) Cookie'den user al - BODY'DEN ASLA ALMA
    const { user, error: authError } = await getAuthenticatedUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      )
    }

    // 2) Body'den sadece form verilerini al (user_id YOK!)
    const body = await request.json()
    const {
      event_id,
      business_name,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      instagram_url,
      google_maps_url,
      additional_notes
    } = body

    // 3) Validation
    if (!event_id || !business_name || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar eksik.' },
        { status: 400 }
      )
    }

    // En az bir kanıt linki olmalı
    if (!website_url && !instagram_url && !google_maps_url) {
      return NextResponse.json(
        { error: 'En az bir kanıt linki gerekli.' },
        { status: 400 }
      )
    }

    // 4) IP al
    const clientIP = getClientIP(request)

    // 5) Service client ile DB işlemleri
    const supabase = getServiceClient()

    // Mevcut pending claim kontrolü (aynı user + aynı event)
    const { data: existingUserClaim } = await supabase
      .from('provider_claims')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingUserClaim) {
      return NextResponse.json(
        { error: 'Bu etkinlik için zaten bekleyen bir talebiniz var.' },
        { status: 400 }
      )
    }

    // Aynı event için başka pending claim var mı?
    const { data: existingEventClaim } = await supabase
      .from('provider_claims')
      .select('id')
      .eq('event_id', event_id)
      .eq('status', 'pending')
      .single()

    if (existingEventClaim) {
      return NextResponse.json(
        { error: 'Bu etkinlik için zaten bekleyen bir talep var.' },
        { status: 400 }
      )
    }

    // 6) Claim oluştur - user.id cookie'den geliyor!
    const { data, error } = await supabase
      .from('provider_claims')
      .insert({
        event_id,
        user_id: user.id, // Cookie'den - güvenli!
        business_name,
        contact_name,
        contact_email,
        contact_phone,
        website_url,
        instagram_url,
        google_maps_url,
        additional_notes,
        contact_ip: clientIP,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Claim insert error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası.' },
        { status: 500 }
      )
    }

    // 7) Event'in claim_status'unu güncelle
    await supabase
      .from('events')
      .update({ claim_status: 'pending' })
      .eq('id', event_id)

    return NextResponse.json({ success: true, claim: data })

  } catch (error) {
    console.error('Claim API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
