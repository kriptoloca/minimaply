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
  
  // Profile'dan role kontrolü
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') return null
  
  return user
}

// POST /api/admin/claim - approve veya reject
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
    const { claim_id, action, note } = body

    // 2. Validasyon
    if (!claim_id || !action) {
      return NextResponse.json(
        { error: 'claim_id ve action zorunlu.' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action. (approve/reject)' },
        { status: 400 }
      )
    }

    // 3. Claim'i çek
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('event_claims')
      .select('*, event:events(id, title)')
      .eq('id', claim_id)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim bulunamadı.' },
        { status: 404 }
      )
    }

    if (claim.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bu claim zaten işlenmiş.' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // 4. Claim'i güncelle
    const { error: updateError } = await supabaseAdmin
      .from('event_claims')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin.id,
        review_note: note || null
      })
      .eq('id', claim_id)

    if (updateError) {
      console.error('Claim update error:', updateError)
      return NextResponse.json(
        { error: 'Güncelleme hatası.' },
        { status: 500 }
      )
    }

    // 5. Eğer APPROVED ise:
    if (action === 'approve') {
      // a) Provider oluştur veya bul
      let providerId = claim.provider_id

      if (!providerId) {
        // Yeni provider oluştur
        const { data: newProvider, error: providerError } = await supabaseAdmin
          .from('providers')
          .insert({
            user_id: claim.user_id,
            business_name: claim.business_name,
            contact_name: claim.contact_name,
            contact_email: claim.contact_email,
            contact_phone: claim.contact_phone,
            website_url: claim.website_url,
            instagram_url: claim.instagram_url,
            status: 'active',
            verified_at: new Date().toISOString()
          })
          .select()
          .single()

        if (providerError) {
          console.error('Provider create error:', providerError)
        } else {
          providerId = newProvider.id

          // Claim'e provider_id ekle
          await supabaseAdmin
            .from('event_claims')
            .update({ provider_id: providerId })
            .eq('id', claim_id)
        }
      }

      // b) Event'i provider'a bağla
      if (providerId) {
        await supabaseAdmin
          .from('events')
          .update({
            provider_id: providerId,
            claim_status: 'claimed',
            source_type: 'verified'
          })
          .eq('id', claim.event_id)
      }

      // c) User role'ü provider yap
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'provider' })
        .eq('id', claim.user_id)
    } else {
      // REJECTED ise sadece event claim_status'u güncelle
      await supabaseAdmin
        .from('events')
        .update({ claim_status: 'none' })
        .eq('id', claim.event_id)
        .eq('claim_status', 'pending')
    }

    // 6. AUDIT LOG
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        admin_id: admin.id,
        action: `claim_${action}`,
        target_type: 'event_claim',
        target_id: claim_id,
        details: {
          event_id: claim.event_id,
          event_title: claim.event?.title,
          business_name: claim.business_name,
          note: note
        }
      })
      .single()

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Claim onaylandı.' : 'Claim reddedildi.',
      status: newStatus
    })

  } catch (error) {
    console.error('Admin claim API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
