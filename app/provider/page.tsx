'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight, LayoutDashboard, CalendarDays, Bell, Settings, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface DashboardStats {
  totalEvents: number
  pendingClaims: number
  approvedClaims: number
  openReports: number
}

export default function ProviderDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    openReports: 0
  })
  const [recentClaims, setRecentClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    const { data: claims } = await supabase
      .from('event_claims')
      .select(`*, event:events(id, title, slug)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (claims) {
      const pending = claims.filter(c => c.status === 'pending').length
      const approved = claims.filter(c => c.status === 'approved').length
      
      setStats(prev => ({
        ...prev,
        pendingClaims: pending,
        approvedClaims: approved,
        totalEvents: approved
      }))
      
      setRecentClaims(claims.slice(0, 5))
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (provider) {
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('provider_id', provider.id)

      if (events && events.length > 0) {
        const eventIds = events.map(e => e.id)
        
        const { data: reports } = await supabase
          .from('event_reports')
          .select('id')
          .eq('status', 'open')
          .in('event_id', eventIds)

        if (reports) {
          setStats(prev => ({ ...prev, openReports: reports.length }))
        }
      }
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-warm-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Bekliyor</span>
      case 'approved':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Onaylandı</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Reddedildi</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-warm-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-bold text-xl text-primary-700">MiniMaply</Link>
              <span className="text-warm-300">|</span>
              <span className="font-medium text-warm-600">Sağlayıcı Paneli</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-warm-600">{profile?.full_name || user?.email}</span>
              <button onClick={handleSignOut} className="p-2 text-warm-500 hover:text-warm-700 rounded-lg hover:bg-warm-50">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<CalendarDays className="w-6 h-6" />} label="Etkinliklerim" value={stats.totalEvents} color="primary" />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Bekleyen Talepler" value={stats.pendingClaims} color="amber" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Onaylı Talepler" value={stats.approvedClaims} color="green" />
          <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Açık Raporlar" value={stats.openReports} color="red" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
              <nav className="p-2">
                <NavItem href="/provider" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
                <NavItem href="/provider/claims" icon={<FileText className="w-5 h-5" />} label="Taleplerim" />
                <NavItem href="/provider/events" icon={<CalendarDays className="w-5 h-5" />} label="Etkinliklerim" />
                <NavItem href="/provider/reports" icon={<Bell className="w-5 h-5" />} label="Raporlar" />
                <div className="border-t border-warm-100 my-2" />
                <NavItem href="/provider/settings" icon={<Settings className="w-5 h-5" />} label="Ayarlar" />
              </nav>
            </div>
            <div className="bg-white rounded-2xl border border-warm-100 p-4 mt-4">
              <h3 className="font-semibold text-warm-800 mb-3">Hızlı İşlemler</h3>
              <Link href="/etkinlikler" className="block w-full p-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-medium text-center transition-colors">
                + Etkinlik Sahiplen
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
              <div className="p-4 border-b border-warm-100 flex items-center justify-between">
                <h3 className="font-semibold text-warm-800">Son Taleplerim</h3>
                <Link href="/provider/claims" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Tümünü Gör →</Link>
              </div>
              
              {recentClaims.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-warm-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-warm-400" />
                  </div>
                  <p className="text-warm-600 mb-4">Henüz bir talebiniz yok.</p>
                  <Link href="/etkinlikler" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                    Etkinliklere göz at <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-warm-100">
                  {recentClaims.map((claim) => (
                    <div key={claim.id} className="p-4 hover:bg-warm-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-warm-800 truncate">{claim.event?.title || 'Etkinlik'}</h4>
                          <p className="text-sm text-warm-500 mt-0.5">{new Date(claim.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>
                      {claim.review_note && claim.status === 'rejected' && (
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg">{claim.review_note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
              <h3 className="font-semibold text-primary-800 mb-2">💡 Nasıl Çalışır?</h3>
              <ul className="text-sm text-primary-700 space-y-2">
                <li>1. Etkinlikler sayfasından etkinliğinizi bulun</li>
                <li>2. "Bu etkinlik benim" butonuna tıklayın</li>
                <li>3. Gerekli bilgileri doldurup başvurun</li>
                <li>4. Onaylandığında etkinliği yönetebilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-warm-100 p-4">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-warm-800">{value}</p>
      <p className="text-sm text-warm-500">{label}</p>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-warm-600 hover:bg-warm-50'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
