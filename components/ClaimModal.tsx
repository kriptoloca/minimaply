'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Building2, User, Mail, Phone, Globe, Instagram, MapPin, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
  }
  onAuthRequired: () => void
}

export default function ClaimModal({ isOpen, onClose, event, onAuthRequired }: ClaimModalProps) {
  const { user, loading: authLoading } = useAuth()
  
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    instagram_url: '',
    google_maps_url: '',
    additional_notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // User kontrolü - modal açıldığında user yoksa auth modal aç
  useEffect(() => {
    if (isOpen && !authLoading && !user) {
      onClose()
      onAuthRequired()
    }
  }, [isOpen, user, authLoading, onClose, onAuthRequired])

  if (!isOpen) return null

  // User yoksa veya auth yükleniyorsa gösterme
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      onAuthRequired()
      return
    }

    if (!form.business_name || !form.contact_name || !form.contact_email) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }

    if (!form.website_url && !form.instagram_url && !form.google_maps_url) {
      setError('Lütfen en az bir kanıt linki girin.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie gönder
        body: JSON.stringify({
          event_id: event.id,
          // user_id artık cookie'den alınıyor - güvenli!
          ...form
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
    
    setLoading(false)
  }

  const resetAndClose = () => {
    setForm({
      business_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      website_url: '',
      instagram_url: '',
      google_maps_url: '',
      additional_notes: ''
    })
    setSuccess(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />
      
      <div className="relative bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-5 border-b border-warm-100 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg text-warm-800">Bu Etkinlik Benim</h3>
            <p className="text-sm text-warm-500 truncate max-w-[250px]">{event.title}</p>
          </div>
          <button 
            onClick={resetAndClose}
            className="p-2 text-warm-500 hover:text-warm-700 rounded-lg hover:bg-warm-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-primary-500" />
            </div>
            <h4 className="text-xl font-bold text-warm-800 mb-2">Talebiniz Alındı!</h4>
            <p className="text-warm-600 mb-6">
              Başvurunuzu inceleyip en kısa sürede size dönüş yapacağız.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-warm-700 text-sm">İşletme Bilgileri</h4>
              
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Kuruluş / Marka Adı <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    placeholder="Örn: Çocuk Sanat Atölyesi"
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Yetkili Ad Soyad <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Ad Soyad"
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-warm-600 mb-1">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="ornek@firma.com"
                      className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-warm-600 mb-1">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      placeholder="0532 123 4567"
                      className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-warm-700 text-sm">
                Kanıt Linkleri <span className="text-warm-400 font-normal">(en az 1 zorunlu)</span>
              </h4>
              
              <div>
                <label className="block text-sm text-warm-600 mb-1">Web Sitesi</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="url"
                    value={form.website_url}
                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    placeholder="https://www.firmaniz.com"
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-warm-600 mb-1">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="url"
                    value={form.instagram_url}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/firmaniz"
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-warm-600 mb-1">Google Maps İşletme</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="url"
                    value={form.google_maps_url}
                    onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-600 mb-1">Ek Notlar (opsiyonel)</label>
              <textarea
                value={form.additional_notes}
                onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                placeholder="Eklemek istediğiniz bilgiler..."
                rows={3}
                className="w-full p-3 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <div className="sticky bottom-0 bg-white pt-3 pb-2 -mx-5 px-5 border-t border-warm-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Başvuruyu Gönder'
                )}
              </button>
              <p className="text-xs text-warm-400 text-center mt-2">
                Başvurunuz incelendikten sonra size dönüş yapılacaktır.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
