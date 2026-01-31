'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'family' | 'provider' | 'admin'
  avatar_url: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfile(data)
    } else if (error && error.code === 'PGRST116') {
      // Profile yok, olustur
      await createProfile(userId)
    }
  }

  async function createProfile(userId: string) {
    // Pending role'u localStorage'dan al
    let pendingRole: 'family' | 'provider' = 'family'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pendingUserRole')
      if (stored === 'provider' || stored === 'family') {
        pendingRole = stored
      }
      localStorage.removeItem('pendingUserRole')
    }

    const { data: userData } = await supabase.auth.getUser()
    const email = userData?.user?.email || ''
    const fullName = userData?.user?.user_metadata?.full_name || email.split('@')[0]

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: pendingRole
      })
      .select()
      .single()

    if (data) {
      setProfile(data)
    } else {
      console.error('Profile creation error:', error)
    }
  }

  useEffect(function initAuth() {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async function(event, session) {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return function() { subscription.unsubscribe() }
  }, [])

  async function signInWithGoogle() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(currentPath)
      }
    })
  }

  async function signInWithEmail(email: string) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(currentPath)
      }
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
