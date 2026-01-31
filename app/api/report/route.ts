import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Cookie'den authenticated user al (opsiyonel - anonim report de olabilir)
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

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Service role client
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

// In-memory rate limiter (production'da Redis kullanılmalı)
const reportRateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 saat
  const maxRequests = 5 // Saat başına max 5 report
  
  const record = reportRateLimiter.get(ip)
  
  if (!record || now > record.resetAt) {
    reportRateLimiter.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // 1) Rate limit kontrolü
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Çok fazla rapor gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    // 2) User varsa al (opsiyonel)
    const user = await getAuthenticatedUser()

    // 3) Body'den form verilerini al
    const body = await request.json()
    const { event_id, reason, description } = body

    if (!event_id || !reason) {
      return NextResponse.json(
        { error: 'Etkinlik ID ve sebep gerekli.' },
        { status: 400 }
      )
    }

    // 4) Service client ile DB işlemleri
    const supabase = getServiceClient()

    // Aynı IP'den aynı event için son 24 saatte report var mı?
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentReport } = await supabase
      .from('event_reports')
      .select('id')
      .eq('event_id', event_id)
      .eq('reporter_ip', clientIP)
      .gte('created_at', oneDayAgo)
      .single()

    if (recentReport) {
      return NextResponse.json(
        { error: 'Bu etkinlik için son 24 saat içinde zaten bir rapor gönderdiniz.' },
        { status: 400 }
      )
    }

    // 5) Report oluştur
    const { data, error } = await supabase
      .from('event_reports')
      .insert({
        event_id,
        reporter_id: user?.id || null, // Opsiyonel - anonim olabilir
        reporter_ip: clientIP,
        reason,
        description,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Report insert error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, report: data })

  } catch (error) {
    console.error('Report API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
