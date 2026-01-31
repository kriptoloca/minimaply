'use client'

import { useState } from 'react'
import { X, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'select-role' | 'email-login' | 'email-sent'
type UserRole = 'family' | 'provider'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  
  const [step, setStep] = useState<Step>('select-role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role)
    setStep('email-login')
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !selectedRole) return

    setLoading(true)
    setError('')

    // Role bilgisini localStorage'a kaydet - callback sonrası kullanılacak
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingUserRole', selectedRole)
    }

    const { error } = await signInWithEmail(email)

    if (error) {
      setError('Bir hata olustu. Lutfen tekrar deneyin.')
      setLoading(false)
      return
    }

    setStep('email-sent')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    if (!selectedRole) return
    
    // Role bilgisini localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingUserRole', selectedRole)
    }
    
    await signInWithGoogle()
  }

  function handleBack() {
    setStep('select-role')
    setSelectedRole(null)
    setError('')
  }

  function handleClose() {
    setStep('select-role')
    setSelectedRole(null)
    setEmail('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'select-role' && (
              <button onClick={handleBack} className="p-1 text-warm-500 hover:text-warm-700 rounded">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-lg text-warm-800">
              {step === 'select-role' && 'Giris Yap'}
              {step === 'email-login' && (selectedRole === 'family' ? 'Aile Girisi' : 'Saglayici Girisi')}
              {step === 'email-sent' && 'Email Gonderildi'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-2 text-warm-500 hover:text-warm-700 rounded-lg hover:bg-warm-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Role Selection */}
          {step === 'select-role' && (
            <div>
              <p className="text-warm-600 text-center mb-6">Hesap turunu secin</p>
              
              <div className="space-y-3">
                <button 
                  onClick={function() { handleRoleSelect('family') }}
                  className="w-full p-4 border-2 border-warm-200 hover:border-primary-300 rounded-xl flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    👨‍👩‍👧
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-warm-800">Aileyim</p>
                    <p className="text-sm text-warm-500">Etkinlik kesfetmek istiyorum</p>
                  </div>
                </button>

                <button 
                  onClick={function() { handleRoleSelect('provider') }}
                  className="w-full p-4 border-2 border-warm-200 hover:border-primary-300 rounded-xl flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 bg-coral-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏫
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-warm-800">Etkinlik Saglayicisiyim</p>
                    <p className="text-sm text-warm-500">Etkinlik eklemek / yonetmek istiyorum</p>
                  </div>
                </button>
              </div>
              
              <p className="text-xs text-warm-400 text-center mt-6">
                Devam ederek Gizlilik Politikasini kabul etmis olursunuz.
              </p>
            </div>
          )}

          {/* STEP 2: Email Login */}
          {step === 'email-login' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">Email Adresin</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={function(e) { setEmail(e.target.value) }}
                    placeholder="ornek@email.com"
                    className="w-full h-12 pl-10 pr-4 border border-warm-200 rounded-xl focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gonderiliyor...
                  </span>
                ) : (
                  'Giris Linki Gonder'
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-warm-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-warm-500">veya</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 border border-warm-200 hover:bg-warm-50 font-medium rounded-xl transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile Giris Yap
              </button>
            </form>
          )}

          {/* STEP 3: Email Sent */}
          {step === 'email-sent' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-500" />
              </div>
              <h4 className="text-lg font-semibold text-warm-800 mb-2">Email Gonderildi!</h4>
              <p className="text-warm-600 mb-4">
                <strong>{email}</strong> adresine giris linki gonderdik.
              </p>
              <p className="text-sm text-warm-500 mb-6">
                Emailini kontrol et ve linke tikla. Bu sekme acik kalabilir, giris yaptiktan sonra otomatik yenilenecek.
              </p>
              <button
                onClick={function() { setStep('email-login') }}
                className="text-primary-600 font-medium text-sm hover:text-primary-700"
              >
                Farkli email kullan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
