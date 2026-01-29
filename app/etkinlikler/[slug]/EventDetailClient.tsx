'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Calendar, Users, ArrowLeft, Share2, Heart, Phone, ExternalLink, ChevronRight, AlertCircle, CheckCircle, Link2, Lightbulb, X, Flag } from 'lucide-react'
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
  source_type?: 'verified' | 'sourced' | 'community'
  source_url?: string
  booking_type?: 'none' | 'external' | 'minimaply'
  booking_url?: string
  category?: { id: string; name: string; slug: string; icon: string }
  city?: { id: string; name: string; slug: string }
  district?: { id: string; name: string; slug: string }
  provider?: { id: string; name: string; phone?: string; email?: string; is_verified: boolean }
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarEvents, setSimilarEvents] = useState<Event[]>([])
  
  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [claimForm, setClaimForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  
  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportForm, setReportForm] = useState({ type: '', message: '' })
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

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

  // Submit claim
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return
    
    setClaimSubmitting(true)
    
    const { error } = await supabase
      .from('provider_claims')
      .insert({
        event_id: event.id,
        event_title: event.title,
        contact_name: claimForm.name,
        contact_phone: claimForm.phone,
        contact_email: claimForm.email,
        message: claimForm.message
      })
    
    setClaimSubmitting(false)
    
    if (error) {
      console.error('Claim error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } else {
      setClaimSuccess(true)
    }
  }

  // Submit report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return
    
    setReportSubmitting(true)
    
    const { error } = await supabase
      .from('event_reports')
      .insert({
        event_id: event.id,
        report_type: reportForm.type,
        message: reportForm.message
      })
    
    setReportSubmitting(false)
    
    if (error) {
      console.error('Report error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } else {
      setReportSuccess(true)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return formatDate(start)
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`
  }

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'verified':
        return { icon: <CheckCircle className="w-4 h-4" />, label: 'Doğrulanmış', className: 'bg-green-100 text-green-700 border-green-200' }
      case 'sourced':
        return { icon: <Link2 className="w-4 h-4" />, label: 'Kaynaktan', className: 'bg-blue-100 text-blue-700 border-blue-200' }
      case 'community':
        return { icon: <Lightbulb className="w-4 h-4" />, label: 'Topluluk İpucu', className: 'bg-amber-100 text-amber-700 border-amber-200' }
      default:
        return null
    }
  }

  // Share function
  const handleShare = async () => {
    const url = window.location.href
    const text = `${event?.title} - MiniMaply`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link kopyalandı!')
    }
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

  const sourceBadge = getSourceBadge(event.source_type || 'sourced')

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
              <button 
                onClick={handleShare}
                className="p-2.5 rounded-xl hover:bg-warm-50 text-warm-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
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
          <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center relative">
            <span className="text-7xl md:text-8xl">{event.category?.icon}</span>
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {sourceBadge && (
                <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${sourceBadge.className}`}>
                  {sourceBadge.icon}
                  {sourceBadge.label}
                </span>
              )}
              {event.is_featured && (
                <span className="bg-amber-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full">⭐ Öne Çıkan</span>
              )}
              {event.is_free && (
                <span className="bg-white/90 backdrop-blur-sm text-primary-600 text-sm font-semibold px-3 py-1.5 rounded-full border border-primary-200">Ücretsiz</span>
              )}
            </div>
          </div>

          <div className="p-5 md:p-8">
            <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-3">
              <span>{event.category?.icon}</span>
              <span>{event.category?.name}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-warm-900 mb-4">{event.title}</h1>

            {/* Source Disclaimer */}
            {event.source_type === 'sourced' && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700">Bu etkinlik bilgileri herkese açık kaynaklardan derlenmiştir. Güncel detaylar için kaynağı kontrol edin.</p>
                  {event.source_url && (
                    <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2">
                      <ExternalLink className="w-4 h-4" /> Kaynağa Git
                    </a>
                  )}
                </div>
              </div>
            )}

            {event.source_type === 'community' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
                <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-700">Bu etkinlik henüz doğrulanmadı. Topluluktan gelen bir ipucu olarak paylaşılmıştır.</p>
                  <button 
                    onClick={() => setClaimModalOpen(true)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 mt-2"
                  >
                    Doğrulamaya yardımcı ol →
                  </button>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard icon={<Calendar className="w-5 h-5" />} label="Tarih" value={formatDateRange(event.start_date, event.end_date)} />
              <InfoCard icon={<Clock className="w-5 h-5" />} label="Saat" value={`${event.start_time?.slice(0, 5)} - ${event.end_time?.slice(0, 5)}`} />
              <InfoCard icon={<span className="text-lg">👶</span>} label="Yaş Grubu" value={`${event.min_age}-${event.max_age} yaş`} />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Kapasite" value={event.capacity ? `${event.capacity} kişi` : 'Sınırsız'} />
            </div>

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
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-warm-800">{event.district?.name}, {event.city?.name}</p>
                  {event.address && <p className="text-sm text-warm-500 mt-1">{event.address}</p>}
                </div>
              </div>
              
              {event.lat && event.lng && (
                <Link href={`/harita?lat=${event.lat}&lng=${event.lng}`} className="mt-3 block aspect-[2/1] bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      <span className="text-sm text-primary-600 font-medium group-hover:underline">Haritada Görüntüle</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Provider */}
            {event.source_type === 'verified' && event.provider && (
              <div className="mb-6">
                <h2 className="font-semibold text-warm-800 mb-3">Sağlayıcı</h2>
                <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">🏢</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-warm-800">{event.provider.name}</p>
                        {event.provider.is_verified && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Doğrulanmış
                          </span>
                        )}
                      </div>
                      {event.provider.phone && <p className="text-sm text-warm-500">{event.provider.phone}</p>}
                    </div>
                  </div>
                  {event.provider.phone && (
                    <a href={`tel:${event.provider.phone.replace(/\s/g, '')}`} className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div>
                <p className="text-sm text-primary-600 font-medium">Fiyat</p>
                <p className="text-2xl font-bold text-primary-700">{event.is_free ? 'Ücretsiz' : `${event.price}₺`}</p>
                {event.source_type === 'sourced' && !event.is_free && (
                  <p className="text-xs text-primary-500 mt-1">* Fiyat bilgisi değişmiş olabilir</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Provider CTA */}
        {event.source_type !== 'verified' && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-6 text-white">
            <h3 className="font-bold text-lg mb-2">Bu etkinliğin sahibi misiniz?</h3>
            <p className="text-primary-100 text-sm mb-4">MiniMaply'de yer alarak daha fazla aileye ulaşın. Etkinliğinizi doğrulayın ve rezervasyon almaya başlayın.</p>
            <button 
              onClick={() => setClaimModalOpen(true)}
              className="bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Etkinliğimi Ekle
            </button>
          </div>
        )}

        {/* Report Link */}
        <div className="text-center mb-6">
          <button 
            onClick={() => setReportModalOpen(true)}
            className="text-sm text-warm-400 hover:text-warm-600 flex items-center gap-1 mx-auto"
          >
            <Flag className="w-4 h-4" /> Bilgi hatalı mı?
          </button>
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
                <Link key={similar.id} href={`/etkinlikler/${similar.slug}`} className="bg-white rounded-xl border border-warm-100 p-4 hover:shadow-soft transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">{similar.category?.icon}</div>
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

      {/* Fixed Bottom CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {event.booking_type === 'minimaply' ? (
          <button className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" /> Rezervasyon Yap
          </button>
        ) : event.booking_type === 'external' && event.booking_url ? (
          <a href={event.booking_url} target="_blank" rel="noopener noreferrer" className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            <ExternalLink className="w-5 h-5" /> Bilet Al
          </a>
        ) : event.source_url ? (
          <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="w-full h-14 bg-warm-100 hover:bg-warm-200 text-warm-700 font-semibold rounded-xl flex items-center justify-center gap-2">
            <ExternalLink className="w-5 h-5" /> Kaynağa Git
          </a>
        ) : event.provider?.phone ? (
          <a href={`tel:${event.provider.phone.replace(/\s/g, '')}`} className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" /> Ara
          </a>
        ) : null}
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setClaimModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Etkinlik Sahiplenme</h3>
              <button onClick={() => setClaimModalOpen(false)} className="p-2 text-warm-500 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {claimSuccess ? (
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="font-bold text-lg text-warm-800 mb-2">Başvurunuz Alındı!</h4>
                <p className="text-warm-600 mb-4">En kısa sürede sizinle iletişime geçeceğiz.</p>
                <button onClick={() => setClaimModalOpen(false)} className="text-primary-600 font-medium">Tamam</button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">Adınız *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.name}
                    onChange={(e) => setClaimForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    placeholder="İsim Soyisim"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={claimForm.phone}
                    onChange={(e) => setClaimForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    placeholder="0532 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={claimForm.email}
                    onChange={(e) => setClaimForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">Not (opsiyonel)</label>
                  <textarea
                    value={claimForm.message}
                    onChange={(e) => setClaimForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 h-24 resize-none"
                    placeholder="Eklemek istediğiniz bir şey var mı?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {claimSubmitting ? 'Gönderiliyor...' : 'Başvur'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Bilgi Hatalı mı?</h3>
              <button onClick={() => setReportModalOpen(false)} className="p-2 text-warm-500 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {reportSuccess ? (
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">🙏</div>
                <h4 className="font-bold text-lg text-warm-800 mb-2">Teşekkürler!</h4>
                <p className="text-warm-600 mb-4">Geri bildiriminiz için teşekkür ederiz.</p>
                <button onClick={() => setReportModalOpen(false)} className="text-primary-600 font-medium">Tamam</button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">Sorun nedir?</label>
                  <div className="space-y-2">
                    {[
                      { value: 'wrong_time', label: '⏰ Saat/tarih yanlış' },
                      { value: 'wrong_location', label: '📍 Konum yanlış' },
                      { value: 'wrong_price', label: '💰 Fiyat yanlış' },
                      { value: 'cancelled', label: '❌ Etkinlik iptal oldu' },
                      { value: 'other', label: '❓ Diğer' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-warm-200 cursor-pointer hover:bg-warm-50">
                        <input
                          type="radio"
                          name="reportType"
                          value={opt.value}
                          checked={reportForm.type === opt.value}
                          onChange={(e) => setReportForm(f => ({ ...f, type: e.target.value }))}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-warm-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">Detay (opsiyonel)</label>
                  <textarea
                    value={reportForm.message}
                    onChange={(e) => setReportForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-200 h-20 resize-none"
                    placeholder="Doğru bilgi nedir?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportForm.type}
                  className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {reportSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
