'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle, AlertTriangle, Clock, MapPin, Banknote, Users, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
  }
}

const reportTypes = [
  { value: 'wrong_date', label: 'Tarih yanlış', icon: Clock },
  { value: 'wrong_time', label: 'Saat yanlış', icon: Clock },
  { value: 'wrong_price', label: 'Ücret yanlış', icon: Banknote },
  { value: 'wrong_location', label: 'Konum/Adres yanlış', icon: MapPin },
  { value: 'wrong_age', label: 'Yaş aralığı yanlış', icon: Users },
  { value: 'event_cancelled', label: 'Etkinlik iptal / artık yok', icon: XCircle },
  { value: 'fraud', label: 'Dolandırıcılık şüphesi', icon: AlertTriangle },
  { value: 'other', label: 'Diğer', icon: AlertCircle },
]

export default function ReportModal({ isOpen, onClose, event }: ReportModalProps) {
  const { user } = useAuth()
  
  const [form, setForm] = useState({
    report_type: '',
    message: '',
    evidence_url: '',
    reporter_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.report_type) {
      setError('Lütfen bir neden seçin.')
      return
    }

    // Anonim rapor için email zorunlu
    if (!user && !form.reporter_email) {
      setError('Giriş yapmadıysanız e-posta adresi gereklidir.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          user_id: user?.id,
          reporter_email: user?.email || form.reporter_email,
          report_type: form.report_type,
          message: form.message,
          evidence_url: form.evidence_url
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
      report_type: '',
      message: '',
      evidence_url: '',
      reporter_email: ''
    })
    setSuccess(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />
      
      <div className="relative bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-5 border-b border-warm-100 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg text-warm-800">Yanlış Bilgi Bildir</h3>
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
            <h4 className="text-xl font-bold text-warm-800 mb-2">Teşekkürler!</h4>
            <p className="text-warm-600 mb-6">
              Bildiriminiz alındı. İnceleyip gerekli düzeltmeleri yapacağız.
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
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Sorun nedir? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {reportTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = form.report_type === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, report_type: type.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-warm-200 hover:border-warm-300 text-warm-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-500' : 'text-warm-400'}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                Detay (opsiyonel)
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Doğru bilgiyi veya ek detayları yazabilirsiniz..."
                rows={3}
                className="w-full p-3 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none resize-none text-sm"
              />
            </div>

            {/* Evidence URL */}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                Doğru bilgi linki (opsiyonel)
              </label>
              <input
                type="url"
                value={form.evidence_url}
                onChange={(e) => setForm({ ...form, evidence_url: e.target.value })}
                placeholder="https://..."
                className="w-full h-11 px-3 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none text-sm"
              />
              <p className="text-xs text-warm-400 mt-1">Doğru bilginin kaynağını paylaşırsanız çok yardımcı olur.</p>
            </div>

            {/* Email for anonymous */}
            {!user && (
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.reporter_email}
                  onChange={(e) => setForm({ ...form, reporter_email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full h-11 px-3 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none text-sm"
                  required={!user}
                />
                <p className="text-xs text-warm-400 mt-1">Geri bildirim için kullanılacaktır.</p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            {/* Submit */}
            <div className="sticky bottom-0 bg-white pt-3 -mx-5 px-5 pb-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-warm-800 hover:bg-warm-900 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Bildirimi Gönder'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
