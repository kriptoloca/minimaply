import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Auth hatası varsa
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
  }

  // Cookie store'a erişim
  const cookieStore = await cookies()

  // Cookie-aware Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true,
            })
          })
        },
      },
    }
  )

  // OAuth code exchange (Google login)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }
  }

  // Magic link / OTP verification
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'signup' | 'recovery' | 'invite' | 'magiclink'
    })
    if (verifyError) {
      console.error('OTP verify error:', verifyError)
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent(verifyError.message)}`, requestUrl.origin)
      )
    }
  }

  // User'ı kontrol et
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Profile var mı kontrol et
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // Profile yoksa oluştur
    if (profileError && profileError.code === 'PGRST116') {
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'family'
        })
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
