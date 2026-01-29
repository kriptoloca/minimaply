'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Calendar, Users, ArrowLeft, Share2, Heart, Phone, ExternalLink, Home, Map, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  title: string
  slug: string
  description?: string
  category_id: string
  city_id: string
  district_id: string
  provider_id: string
  address?: string
  lat?: number
  lng?: number
  min_age: number
  max_age: number
  price: number
  is_free: boolean
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  capacity?: number
  is_featured: boolean
  category?: { id: string; name: string; slug: string; icon: string }
  city?: { id: string; name: string; slug: string }
  district?: { id: string; name: string; slug: string }
  provider?: { id: string; name: string; phone?: string; email?: string; is_verified: boolean }
}

export default function EventDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarEvents, setSimilarEvents] = useState<Event[]>([])

  useEffect(() => {
    async function fetchEvent() {
      if (!slug) return

      setLoading(true)
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name, slug, icon),
          city:cities(id, name, slug),
          district:districts(id, name, slug),
          provider:providers(id, name, phone, email, is_verified)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching event:', error)
        setEvent(null)
      } else {
        setEvent(data)
        
        // Benzer etkinlikleri çek
        if (data?.category_id && data?.city_id) {
          const { data: similar } = await supabase
            .from('events')
            .select(`
              *,
              category:categories(id, name, slug, icon),
              city:cities(id, name, slug),
              district:districts(id, name, slug)
            `)
            .eq('category_id', data.category_id)
            .eq('city_id', data.city_id)
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(3)

          setSimilarEvents(similar || [])
        }
      }
      
      setLoading(false)
    }

    fetchEvent()
  }, [slug])

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  // Format date range
  const formatDateRange = (start: string, end: string) => {
    if (start === end) {
      return formatDate(start)
    }
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-warm-100 rounded w-1/3" />
            <div className="aspect-[16/9] bg-warm-100 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-6 bg-warm-100 rounded w-2/3" />
              <div className="h-4 bg-warm-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-warm-800 mb-2">Etkinlik Bulunamadı</h1>
          <p className="text-warm-500 mb-4">Bu etkinlik mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/etkinlikler" className="text-primary-600 font-medium hover:text-primary-700">
            ← Etkinliklere Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/etkinlikler" className="flex items-center gap-2 text-warm-600 hover:text-primary-600 transition-colors min-w-[44px] min-h-[44px]">
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              <span className="hidden md:inline font-medium">Etkinlikler</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl hover:bg-warm-50 text-warm-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Share2 className="w-5 h-5" strokeWidth={2} />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-warm-50 text-warm-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Heart className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-warm-100 mb-6">
          {/* Image */}
          <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)"/%3E%3C/svg%3E")' }} />
            
            <span className="text-7xl md:text-8xl">{event.category?.icon}</span>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {event.is_featured && (
                <span className="bg-amber-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  ⭐ Öne Çıkan
                </span>
              )}
              {event.is_free && (
                <span className="bg-white/90 backdrop-blur-sm text-primary-600 text-sm font-semibold px-3 py-1.5 rounded-full border border-primary-200">
                  Ücretsiz
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-8">
            {/* Category */}
            <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-3">
              <span>{event.category?.icon}</span>
              <span>{event.category?.name}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              {event.title}
            </h1>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard 
                icon={<Calendar className="w-5 h-5" strokeWidth={2} />}
                label="Tarih"
                value={formatDateRange(event.start_date, event.end_date)}
              />
              <InfoCard 
                icon={<Clock className="w-5 h-5" strokeWidth={2} />}
                label="Saat"
                value={`${event.start_time?.slice(0, 5)} - ${event.end_time?.slice(0, 5)}`}
              />
              <InfoCard 
                icon={<span className="text-lg">👶</span>}
                label="Yaş Grubu"
                value={`${event.min_age}-${event.max_age} yaş`}
              />
              <InfoCard 
                icon={<Users className="w-5 h-5" strokeWidth={2} />}
                label="Kapasite"
                value={event.capacity ? `${event.capacity} kişi` : 'Sınırsız'}
              />
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h2 className="font-semibold text-warm-800 mb-2">Açıklama</h2>
                <p className="text-warm-600 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Location */}
            <div className="mb-6">
              <h2 className="font-semibold text-warm-800 mb-3">Konum</h2>
              <div className="flex items-start gap-3 p-4 bg-warm-50 rounded-xl">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <div>
                  <p className="font-medium text-warm-800">{event.district?.name}, {event.city?.name}</p>
                  {event.address && <p className="text-sm text-warm-500 mt-1">{event.address}</p>}
                </div>
              </div>
              
              {/* Mini Map Preview */}
              {event.lat && event.lng && (
                <Link 
                  href={`/harita?lat=${event.lat}&lng=${event.lng}`}
                  className="mt-3 block aspect-[2/1] bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl overflow-hidden relative group"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2" strokeWidth={2} />
                      <span className="text-sm text-primary-600 font-medium group-hover:underline">Haritada Görüntüle</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Provider */}
            {event.provider && (
              <div className="mb-6">
                <h2 className="font-semibold text-warm-800 mb-3">Sağlayıcı</h2>
                <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                      🏢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-warm-800">{event.provider.name}</p>
                        {event.provider.is_verified && (
                          <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">✓ Doğrulanmış</span>
                        )}
                      </div>
                      {event.provider.phone && (
                        <p className="text-sm text-warm-500">{event.provider.phone}</p>
                      )}
                    </div>
                  </div>
                  {event.provider.phone && (
                    <a 
                      href={`tel:${event.provider.phone.replace(/\s/g, '')}`}
                      className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" strokeWidth={2} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div>
                <p className="text-sm text-primary-600 font-medium">Fiyat</p>
                <p className="text-2xl font-bold text-primary-700">
                  {event.is_free ? 'Ücretsiz' : `${event.price}₺`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-warm-800">Benzer Etkinlikler</h2>
              <Link href={`/etkinlikler?kategori=${event.category?.slug}&sehir=${event.city?.slug}`} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarEvents.map(similar => (
                <Link 
                  key={similar.id}
                  href={`/etkinlikler/${similar.slug}`}
                  className="bg-white rounded-xl border border-warm-100 p-4 hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                      {similar.category?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-warm-800 truncate">{similar.title}</h3>
                      <p className="text-sm text-warm-500">{similar.district?.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom CTA - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" strokeWidth={2} />
          Rezervasyon Yap
        </button>
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:block fixed bottom-8 right-8">
        <button className="h-14 px-8 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
          <Phone className="w-5 h-5" strokeWidth={2} />
          Rezervasyon Yap
        </button>
      </div>
    </div>
  )
}

// Info Card Component
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-warm-50 rounded-xl">
      <div className="flex items-center gap-2 text-warm-500 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-warm-800">{value}</p>
    </div>
  )
}
