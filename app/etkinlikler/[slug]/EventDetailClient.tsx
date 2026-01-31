'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Clock, Calendar, Users, ArrowLeft, Share2, Heart, ExternalLink, AlertCircle, CheckCircle, Link2, Lightbulb, Flag, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const ClaimModal = dynamic(() => import('@/components/ClaimModal'), { ssr: false })
const ReportModal = dynamic(() => import('@/components/ReportModal'), { ssr: false })
const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })

const MiniMap = dynamic(() => import('./MiniMap'), { 
  ssr: false,
  loading: function MapLoading() {
    return (
      <div className="aspect-[2/1] bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2 animate-pulse" />
          <span className="text-sm text-primary-600">Harita yükleniyor...</span>
        </div>
      </div>
    )
  }
})

interface EventData {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string
  city_id: string
  district_id: string
  provider_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  min_age: number
  max_age: number
  price: number
  is_free: boolean
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  capacity: number | null
  is_featured: boolean
  source_type: string | null
  source_url: string | null
  booking_type: string | null
  booking_url: string | null
  claim_status: string | null
  category: { id: string; name: string; slug: string; icon: string } | null
  city: { id: string; name: string; slug: string } | null
  district: { id: string; name: string; slug: string } | null
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth()
  
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarEvents, setSimilarEvents] = useState<EventData[]>([])
  
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(function fetchEventEffect() {
    async function fetchEvent() {
      if (!slug) return
      setLoading(true)
      
      const { data, error } = await supabase
        .from('events')
        .select('*, category:categories(id, name, slug, icon), city:cities(id, name, slug), district:districts(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Event fetch error:', error)
        setEvent(null)
      } else if (data) {
        const normalized = {
          ...data,
          category: Array.isArray(data.category) ? data.category[0] : data.category,
          city: Array.isArray(data.city) ? data.city[0] : data.city,
          district: Array.isArray(data.district) ? data.district[0] : data.district,
        }
        setEvent(normalized)
        
        if (normalized.category_id) {
          const { data: similar } = await supabase
            .from('events')
            .select('*, category:categories(id, name, slug, icon)')
            .eq('category_id', normalized.category_id)
            .eq('is_active', true)
            .neq('id', normalized.id)
            .limit(4)
          
          if (similar) {
            setSimilarEvents(similar.map(function(e) {
              return {
                ...e,
                category: Array.isArray(e.category) ? e.category[0] : e.category
              }
            }))
          }
        }
      }
      
      setLoading(false)
    }
    
    fetchEvent()
  }, [slug])

  function handleClaimClick() {
    if (authLoading) return
    
    if (!user) {
      setAuthModalOpen(true)
    } else {
      setClaimModalOpen(true)
    }
  }

  async function handleShare() {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.title + ' - MiniMaply',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link kopyalandi!')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  function formatTime(timeStr: string) {
    if (!timeStr) return ''
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-warm-600">Yukleniyor...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-warm-400" />
          </div>
          <h1 className="text-xl font-bold text-warm-800 mb-2">Etkinlik Bulunamadi</h1>
          <p className="text-warm-600 mb-6">Bu etkinlik mevcut degil veya kaldirilmis olabilir.</p>
          <Link href="/etkinlikler" className="inline-flex items-center gap-2 text-primary-600 font-medium">
            <ArrowLeft className="w-4 h-4" /> Etkinliklere Don
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-warm-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/etkinlikler" className="flex items-center gap-2 text-warm-600 hover:text-warm-800">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 text-warm-500 hover:text-warm-700 rounded-lg hover:bg-warm-50">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-warm-500 hover:text-red-500 rounded-lg hover:bg-warm-50">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          {event.category && (
            <Link 
              href={'/etkinlikler?kategori=' + event.category.slug}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 mb-2"
            >
              <span>{event.category.icon}</span>
              <span>{event.category.name}</span>
            </Link>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800 mb-3">{event.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-warm-600">
            {event.city && event.district && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.district.name}, {event.city.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.min_age}-{event.max_age} yas
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {event.lat && event.lng && (
              <MiniMap lat={event.lat} lng={event.lng} />
            )}

            {event.description && (
              <div className="bg-white rounded-2xl border border-warm-100 p-5">
                <h2 className="font-semibold text-warm-800 mb-3">Etkinlik Hakkinda</h2>
                <p className="text-warm-600 whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {event.address && (
              <div className="bg-white rounded-2xl border border-warm-100 p-5">
                <h2 className="font-semibold text-warm-800 mb-3">Adres</h2>
                <p className="text-warm-600">{event.address}</p>
                {event.lat && event.lng && (
                  <a 
                    href={'https://www.google.com/maps/dir/?api=1&destination=' + event.lat + ',' + event.lng}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-primary-600 font-medium text-sm hover:text-primary-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Yol Tarifi Al
                  </a>
                )}
              </div>
            )}

            {event.source_type === 'sourced' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Topluluk Katkisi</p>
                    <p className="text-sm text-amber-700 mt-1">Bu etkinlik bilgileri otomatik olarak toplanmistir.</p>
                    {event.source_url && (
                      <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800 mt-2 font-medium">
                        <Link2 className="w-4 h-4" /> Kaynak
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-warm-100 p-5">
              <div className="text-center mb-4 pb-4 border-b border-warm-100">
                <div className="text-3xl font-bold text-primary-600">
                  {event.is_free ? 'Ucretsiz' : 'TL' + event.price}
                </div>
                {!event.is_free && <p className="text-sm text-warm-500">kisi basi</p>}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-500">Tarih</p>
                    <p className="font-medium text-warm-800">{formatDate(event.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-500">Saat</p>
                    <p className="font-medium text-warm-800">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                  </div>
                </div>
              </div>

              {event.booking_url && (
                <a
                  href={event.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-center transition-colors"
                >
                  Rezervasyon Yap
                </a>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-warm-100 p-5">
              {event.claim_status === 'pending' ? (
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Talep inceleniyor</span>
                </div>
              ) : event.claim_status === 'claimed' ? (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Dogrulanmis Etkinlik</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimClick}
                  disabled={authLoading}
                  className="w-full py-3 border-2 border-primary-200 hover:border-primary-300 text-primary-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lightbulb className="w-5 h-5" />
                  Bu Etkinlik Benim
                </button>
              )}
              
              <button
                onClick={function() { setReportModalOpen(true) }}
                className="w-full mt-3 py-2 text-warm-500 hover:text-warm-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Yanlis Bilgi Bildir
              </button>
            </div>
          </div>
        </div>

        {similarEvents.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-warm-800 mb-4">Benzer Etkinlikler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarEvents.map(function(e) {
                return (
                  <Link
                    key={e.id}
                    href={'/etkinlikler/' + e.slug}
                    className="bg-white rounded-xl border border-warm-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{e.category?.icon || ''}</span>
                    <h3 className="font-medium text-warm-800 mt-2 line-clamp-2 text-sm">{e.title}</h3>
                    <p className="text-xs text-warm-500 mt-1">{e.min_age}-{e.max_age} yas</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <ClaimModal
        isOpen={claimModalOpen}
        onClose={function() { setClaimModalOpen(false) }}
        event={{ id: event.id, title: event.title }}
        onAuthRequired={function() {
          setClaimModalOpen(false)
          setAuthModalOpen(true)
        }}
      />
      
      <ReportModal
        isOpen={reportModalOpen}
        onClose={function() { setReportModalOpen(false) }}
        event={{ id: event.id, title: event.title }}
      />
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={function() { setAuthModalOpen(false) }}
      />
    </div>
  )
}
