'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, Loader2, Shield, Flag, Users } from 'lucide-react'

interface Claim {
  id: string
  event_id: string
  user_id: string
  business_name: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  website_url: string | null
  instagram_url: string | null
  google_maps_url: string | null
  additional_notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  event?: { title: string; slug: string }
}

interface Report {
  id: string
  event_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
  created_at: string
  event?: { title: string; slug: string }
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'claims' | 'reports'>('claims')
  const [claims, setClaims] = useState<Claim[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData()
    }
  }, [profile])

  const fetchData = async () => {
    setLoading(true)
    
    // Claims
    const { data: claimsData } = await supabase
      .from('provider_claims')
      .select('*, event:events(title, slug)')
      .order('created_at', { ascending: false })

    if (claimsData) {
      setClaims(claimsData.map(c => ({
        ...c,
        event: Array.isArray(c.event) ? c.event[0] : c.event
      })))
    }

    // Reports
    const { data: reportsData } = await supabase
      .from('event_reports')
      .select('*, event:events(title, slug)')
      .order('created_at', { ascending: false })

    if (reportsData) {
      setReports(reportsData.map(r => ({
        ...r,
        event: Array.isArray(r.event) ? r.event[0] : r.event
      })))
    }

    setLoading(false)
  }

  const handleClaimAction = async (claimId: string, status: 'approved' | 'rejected') => {
    setActionLoading(claimId)
    
    try {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie gönder
        body: JSON.stringify({ status }) // admin_id artık cookie'den alınıyor
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Claim action error:', error)
    }
    
    setActionLoading(null)
  }

  const handleReportAction = async (reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken') => {
    setActionLoading(reportId)
    
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie gönder
        body: JSON.stringify({ status }) // admin_id artık cookie'den alınıyor
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Report action error:', error)
    }
    
    setActionLoading(null)
  }

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-warm-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-warm-800 mb-2">Erişim Engellendi</h1>
          <p className="text-warm-600 mb-6">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
          <Link href="/" className="text-primary-600 font-medium">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  const pendingClaims = claims.filter(c => c.status === 'pending').length
  const pendingReports = reports.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-warm-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-warm-600 hover:text-warm-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-bold text-xl text-warm-800">Admin Panel</h1>
            </div>
            <div className="text-sm text-warm-500">
              {profile?.full_name || user.email}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-warm-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warm-800">{pendingClaims}</p>
                <p className="text-xs text-warm-500">Bekleyen Talep</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-warm-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warm-800">{pendingReports}</p>
                <p className="text-xs text-warm-500">Bekleyen Rapor</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-warm-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warm-800">
                  {claims.filter(c => c.status === 'approved').length}
                </p>
                <p className="text-xs text-warm-500">Onaylanan</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-warm-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warm-800">{claims.length}</p>
                <p className="text-xs text-warm-500">Toplam Talep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'claims'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-warm-600 hover:bg-warm-50'
            }`}
          >
            Sahiplenme Talepleri {pendingClaims > 0 && `(${pendingClaims})`}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-warm-600 hover:bg-warm-50'
            }`}
          >
            Raporlar {pendingReports > 0 && `(${pendingReports})`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : activeTab === 'claims' ? (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-warm-100">
                <p className="text-warm-500">Henüz talep yok.</p>
              </div>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="bg-white rounded-xl border border-warm-100 overflow-hidden">
                  <div className="p-4 border-b border-warm-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-warm-800">{claim.business_name}</h3>
                      <p className="text-sm text-warm-500">{claim.event?.title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {claim.status === 'pending' ? 'Bekliyor' :
                       claim.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                    </span>
                  </div>
                  <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-warm-500">İletişim</p>
                      <p className="text-warm-800">{claim.contact_name}</p>
                      <p className="text-warm-600">{claim.contact_email}</p>
                      {claim.contact_phone && <p className="text-warm-600">{claim.contact_phone}</p>}
                    </div>
                    <div>
                      <p className="text-warm-500">Kanıt Linkleri</p>
                      {claim.website_url && (
                        <a href={claim.website_url} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline truncate">
                          {claim.website_url}
                        </a>
                      )}
                      {claim.instagram_url && (
                        <a href={claim.instagram_url} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline truncate">
                          {claim.instagram_url}
                        </a>
                      )}
                      {claim.google_maps_url && (
                        <a href={claim.google_maps_url} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline truncate">
                          Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                  {claim.additional_notes && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-warm-500">Notlar:</p>
                      <p className="text-sm text-warm-700">{claim.additional_notes}</p>
                    </div>
                  )}
                  {claim.status === 'pending' && (
                    <div className="p-4 bg-warm-50 flex gap-2">
                      <button
                        onClick={() => handleClaimAction(claim.id, 'approved')}
                        disabled={actionLoading === claim.id}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === claim.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Onayla
                      </button>
                      <button
                        onClick={() => handleClaimAction(claim.id, 'rejected')}
                        disabled={actionLoading === claim.id}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reddet
                      </button>
                      <Link
                        href={`/etkinlikler/${claim.event?.slug}`}
                        className="py-2 px-4 bg-warm-200 hover:bg-warm-300 text-warm-700 font-medium rounded-lg flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-warm-100">
                <p className="text-warm-500">Henüz rapor yok.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-warm-100 overflow-hidden">
                  <div className="p-4 border-b border-warm-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-warm-800">{report.event?.title}</h3>
                      <p className="text-sm text-warm-500">{report.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'action_taken' ? 'bg-green-100 text-green-700' :
                      'bg-warm-100 text-warm-700'
                    }`}>
                      {report.status === 'pending' ? 'Bekliyor' :
                       report.status === 'reviewed' ? 'İncelendi' :
                       report.status === 'action_taken' ? 'İşlem Yapıldı' : 'Reddedildi'}
                    </span>
                  </div>
                  {report.description && (
                    <div className="p-4">
                      <p className="text-sm text-warm-700">{report.description}</p>
                    </div>
                  )}
                  {report.status === 'pending' && (
                    <div className="p-4 bg-warm-50 flex gap-2">
                      <button
                        onClick={() => handleReportAction(report.id, 'reviewed')}
                        disabled={actionLoading === report.id}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50"
                      >
                        İncelendi
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'action_taken')}
                        disabled={actionLoading === report.id}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50"
                      >
                        İşlem Yapıldı
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'dismissed')}
                        disabled={actionLoading === report.id}
                        className="flex-1 py-2 bg-warm-300 hover:bg-warm-400 text-warm-700 font-medium rounded-lg disabled:opacity-50"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
