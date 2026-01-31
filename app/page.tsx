'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { MapPin, Search, ArrowRight, CheckCircle, Clock, Sparkles, Map, Menu, X, Home, Heart, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })

const categories = [
  { name: 'Atolye', icon: '🎨', slug: 'atolye' },
  { name: 'Tiyatro', icon: '🎭', slug: 'tiyatro' },
  { name: 'Muzik', icon: '🎵', slug: 'muzik' },
  { name: 'Spor', icon: '⚽', slug: 'spor' },
  { name: 'Muze', icon: '🏛️', slug: 'muze' },
  { name: 'Acik Hava', icon: '🌳', slug: 'acik-hava' },
]

const cities = [
  { name: 'Istanbul', slug: 'istanbul' },
  { name: 'Ankara', slug: 'ankara' },
  { name: 'Izmir', slug: 'izmir' },
  { name: 'Bursa', slug: 'bursa' },
]

const featuredEvents = [
  { title: 'Seramik Atolyesi', category: '🎨', location: 'Kadikoy', price: '250₺', age: '3-6 yas', tag: 'Bugun', isFree: false },
  { title: 'Cocuk Tiyatrosu', category: '🎭', location: 'Besiktas', price: 'Ucretsiz', age: '4-6 yas', tag: null, isFree: true },
  { title: 'Mini Futbol Okulu', category: '⚽', location: 'Atasehir', price: '150₺', age: '5-6 yas', tag: 'Yarin', isFree: false },
  { title: 'Resim Kursu', category: '🎨', location: 'Sisli', price: '180₺', age: '4-6 yas', tag: 'Bugun', isFree: false },
]

export default function HomePage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(function scrollLock() {
    if (menuOpen || filterOpen || authModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return function() {
      document.body.style.overflow = ''
    }
  }, [menuOpen, filterOpen, authModalOpen])

  function handleSignOut() {
    signOut()
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-surface pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
      
      {/* HEADER */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            <Link href="/" className="flex items-center gap-2 md:gap-4 group">
              <Image 
                src="/logo-icon.png" 
                alt="MiniMaply" 
                width={150}
                height={150}
                className="w-auto h-10 md:h-14 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-xl md:text-2xl text-primary-700">MiniMaply</span>
            </Link>

            <div className="flex md:hidden items-center gap-1">
              <button 
                onClick={function() { setFilterOpen(true) }}
                className="p-2.5 text-warm-600 hover:text-primary-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <Link 
                href="/harita"
                className="p-2.5 text-warm-600 hover:text-primary-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Harita"
              >
                <Map className="w-5 h-5" strokeWidth={2.5} />
              </Link>
              <button 
                onClick={function() { setMenuOpen(true) }}
                className="p-2.5 text-warm-600 hover:text-primary-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/harita" className="inline-flex items-center gap-1.5 text-warm-600 hover:text-primary-600 font-semibold transition-colors">
                🗺️ Haritada Kesfet
              </Link>
              
              {authLoading ? (
                <div className="w-20 h-10 bg-warm-100 rounded-lg animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <span className="text-warm-600 text-sm">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-warm-600 hover:text-red-600 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cikis Yap
                  </button>
                </div>
              ) : (
                <button 
                  onClick={function() { setAuthModalOpen(true) }}
                  className="text-warm-600 hover:text-primary-600 font-semibold transition-colors"
                >
                  Giris Yap
                </button>
              )}
              
              <Link href="/etkinlikler" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold h-12 px-6 rounded-xl transition-all flex items-center">
                Etkinlik Bul
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={function() { setMenuOpen(false) }} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="p-4 border-b border-warm-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5" onClick={function() { setMenuOpen(false) }}>
                <Image src="/logo-icon.png" alt="MiniMaply" width={80} height={80} className="w-auto h-9 object-contain" />
                <span className="font-bold text-lg text-primary-700">MiniMaply</span>
              </Link>
              <button onClick={function() { setMenuOpen(false) }} className="p-2 text-warm-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link 
                href="/etkinlikler" 
                onClick={function() { setMenuOpen(false) }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary-50 text-primary-700 font-semibold min-h-[44px]"
              >
                <span className="text-lg">🔍</span>
                <span className="text-sm">Etkinlik Bul</span>
              </Link>
              <MenuLink href="/harita" icon="🗺️" text="Harita" onClick={function() { setMenuOpen(false) }} />
              
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-warm-50 min-h-[44px]">
                    <span className="text-lg">👤</span>
                    <span className="font-medium text-warm-700 text-sm">{profile?.full_name || user.email?.split('@')[0]}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors min-h-[44px] w-full text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cikis Yap</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={function() {
                    setMenuOpen(false)
                    setAuthModalOpen(true)
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-warm-50 transition-colors min-h-[44px] w-full"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium text-warm-700 text-sm">Giris Yap</span>
                </button>
              )}
              
              <div className="pt-3 border-t border-warm-100 mt-3">
                <p className="text-xs text-warm-400 mb-2 px-3 font-medium uppercase tracking-wide">Kategoriler</p>
                <MenuLink href="/etkinlikler?kategori=atolye" icon="🎨" text="Atolye" onClick={function() { setMenuOpen(false) }} />
                <MenuLink href="/etkinlikler?kategori=tiyatro" icon="🎭" text="Tiyatro" onClick={function() { setMenuOpen(false) }} />
                <MenuLink href="/etkinlikler?kategori=spor" icon="⚽" text="Spor" onClick={function() { setMenuOpen(false) }} />
                <MenuLink href="/etkinlikler?kategori=muzik" icon="🎵" text="Muzik" onClick={function() { setMenuOpen(false) }} />
              </div>
              
              <div className="pt-3 border-t border-warm-100 mt-3">
                <p className="text-xs text-warm-400 mb-2 px-3 font-medium uppercase tracking-wide">Sehirler</p>
                {cities.map(function(city) {
                  return <MenuLink key={city.slug} href={'/etkinlikler?sehir=' + city.slug} icon="📍" text={city.name} onClick={function() { setMenuOpen(false) }} />
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={function() { setFilterOpen(false) }} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Etkinlik Ara</h3>
              <button onClick={function() { setFilterOpen(false) }} className="p-2 text-warm-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📍 Sehir</label>
                <select className="w-full p-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[48px]">
                  <option value="">Tum Sehirler</option>
                  {cities.map(function(city) {
                    return <option key={city.slug} value={city.slug}>{city.name}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">🎨 Kategori</label>
                <select className="w-full p-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[48px]">
                  <option value="">Tum Kategoriler</option>
                  {categories.map(function(cat) {
                    return <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📅 Ne Zaman</label>
                <div className="flex gap-2">
                  <FilterChip label="Bugun" active />
                  <FilterChip label="Yarin" />
                  <FilterChip label="Hafta Sonu" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">💸 Fiyat</label>
                <div className="flex gap-2">
                  <FilterChip label="Hepsi" active />
                  <FilterChip label="Ucretsiz" />
                </div>
              </div>
              <button 
                onClick={function() { setFilterOpen(false) }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold h-12 px-6 rounded-xl transition-all"
              >
                Etkinlikleri Goster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE HERO */}
      <section className="md:hidden px-5 py-6 bg-surface">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-warm-900 mb-2 leading-tight">
            Bugun Cocugunla<br />
            <span className="text-primary-600">Ne Yapsan?</span>
          </h1>
          <p className="text-warm-500 text-sm">
            0-6 yas icin yakin etkinlikleri kesfet
          </p>
        </div>

        <Link 
          href="/etkinlikler"
          className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold h-12 rounded-xl transition-all mb-5"
        >
          <MapPin className="w-5 h-5" strokeWidth={2.5} />
          Yakinimdaki Etkinlikler
        </Link>
        
        <div className="overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {featuredEvents.map(function(event, index) {
              return <MobileEventCard key={index} event={event} />
            })}
          </div>
        </div>
      </section>

      {/* DESKTOP HERO */}
      <section className="hidden md:block relative overflow-hidden bg-surface">
        <div 
          className="absolute inset-0 opacity-60"
          style={{ background: 'linear-gradient(135deg, #E8F5F2 0%, #F0FAF8 50%, #FAFBFA 100%)' }}
        />
        
        <div className="container-wide py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white border border-primary-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary-500" strokeWidth={2.5} />
                <span className="text-sm font-medium text-primary-700">0-6 yas icin ozel</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                <span className="text-warm-800">Sehrindeki</span>
                <span className="block text-primary-600">Cocuk Etkinlikleri Haritasi</span>
              </h1>
              
              <p className="text-lg text-warm-600 mb-8 leading-relaxed">
                Sehrindeki en iyi etkinlikleri senin icin topladik.
              </p>
              
              <div className="bg-white rounded-2xl p-3 shadow-soft border border-warm-100">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <select className="w-full pl-12 pr-4 h-12 rounded-xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none cursor-pointer transition-all">
                      <option value="">Sehir Secin</option>
                      {cities.map(function(city) {
                        return <option key={city.name} value={city.slug}>{city.name}</option>
                      })}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <select className="w-full pl-12 pr-4 h-12 rounded-xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none cursor-pointer transition-all">
                      <option value="">Kategori Secin</option>
                      {categories.map(function(cat) {
                        return <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                      })}
                    </select>
                  </div>
                  <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold h-12 px-6 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md">
                    Etkinlik Bul
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="space-y-4">
                {featuredEvents.slice(0, 3).map(function(event, index) {
                  return (
                    <Link
                      href="/etkinlikler"
                      key={index}
                      className={'block bg-white rounded-2xl p-4 shadow-soft border border-warm-100 transform ' +
                        (index === 0 ? 'translate-x-4 rotate-1' : 
                        index === 1 ? '-translate-x-2 -rotate-1' : 
                        'translate-x-8 rotate-1') +
                        ' hover:scale-[1.02] hover:shadow-soft-lg transition-all duration-300 cursor-pointer group'}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {event.category}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-warm-800 group-hover:text-primary-600 transition-colors truncate">
                              {event.title}
                            </h3>
                            {event.tag && (
                              <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' +
                                (event.tag === 'Bugun' 
                                  ? 'bg-coral-100 text-coral-700' 
                                  : 'bg-warm-100 text-warm-600')
                              }>
                                {event.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-warm-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                              {event.location}
                            </span>
                            <span>•</span>
                            <span>{event.age}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={'font-semibold ' + (event.isFree ? 'text-primary-600' : 'text-warm-800')}>
                            {event.price}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NASIL CALISIR */}
      <section className="py-8 md:py-14 bg-white border-y border-warm-100">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
            <Step number="1" color="primary" text="Sehrini sec" />
            <Connector />
            <Step number="2" color="coral" text="Detaylari gor" />
            <Connector />
            <Step number="3" color="primary" text="Etkinligi planla" />
          </div>
        </div>
      </section>

      {/* KATEGORILER */}
      <section className="py-10 md:py-16 bg-surface">
        <div className="container-wide">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-warm-900 mb-2">Kategoriler</h2>
            <p className="text-warm-500 text-sm md:text-base">Ilgi alanina gore etkinlikleri kesfet</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4">
            {categories.map(function(cat) {
              return (
                <Link 
                  key={cat.slug}
                  href={'/etkinlikler?kategori=' + cat.slug}
                  className="bg-white rounded-xl p-3 md:p-5 text-center border border-warm-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary-100 transition-all group min-h-[88px] md:min-h-[100px] flex flex-col items-center justify-center"
                >
                  <div className="text-3xl md:text-4xl mb-1.5 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <span className="font-medium text-xs md:text-sm text-warm-700 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* SEHIRLER */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container-wide">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-warm-900 mb-2">Sehirler</h2>
            <p className="text-warm-500 text-sm md:text-base">Yakinindaki etkinlikleri bul</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {cities.map(function(city) {
              return (
                <Link 
                  key={city.name}
                  href={'/etkinlikler?sehir=' + city.slug}
                  className="bg-white rounded-xl p-5 md:p-6 text-center border border-warm-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary-100 transition-all group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 md:w-7 md:h-7 text-primary-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-warm-800 mb-0.5 group-hover:text-primary-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-warm-400 text-xs md:text-sm">Populer etkinlikler</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* DEGER ONERILERI */}
      <section className="py-10 md:py-16 bg-surface">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            <ValueCard 
              icon={<Map className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />}
              color="primary"
              title="Harita ile Kesfet"
              description="Yakinindaki etkinlikleri gor"
            />
            <ValueCard 
              icon={<Clock className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />}
              color="coral"
              title="Kolay Katilim"
              description="Hemen iletisime gec"
            />
            <ValueCard 
              icon={<CheckCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />}
              color="primary"
              title="Guvenilir Mekanlar"
              description="Dogrulanmis saglayicilar"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-12 md:py-20 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1D9B85 0%, #2AAA96 100%)' }}
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container-wide relative">
          <div className="max-w-xl mx-auto text-center px-2">
            <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-5">Hemen Kesfetmeye Basla!</h2>
            <p className="text-sm md:text-lg text-white/90 mb-6 md:mb-8">
              Cocugunla yapabilecegin aktiviteleri MiniMaply'de bul.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/harita" className="bg-white text-primary-600 font-semibold h-12 px-6 rounded-xl shadow-soft hover:shadow-soft-lg transition-all inline-flex items-center justify-center gap-2 text-sm md:text-base">
                <Map className="w-5 h-5" strokeWidth={2.5} />
                Haritada Kesfet
              </Link>
              <Link href="/etkinlikler" className="border-2 border-white/30 text-white font-semibold h-12 px-6 rounded-xl hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2 text-sm md:text-base">
                Listeyi Gor
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-warm-900 text-white py-10 md:py-14">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <Image src="/logo-icon.png" alt="MiniMaply" width={80} height={80} className="w-auto h-8 object-contain" />
                <span className="font-bold text-lg">MiniMaply</span>
              </Link>
              <p className="text-warm-400 text-sm leading-relaxed">Sehrindeki Cocuk Etkinlikleri Haritasi</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Kesfet</h4>
              <ul className="space-y-2 text-warm-400 text-sm">
                <li><Link href="/etkinlikler" className="hover:text-white transition-colors">Etkinlikler</Link></li>
                <li><Link href="/harita" className="hover:text-white transition-colors">Harita</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Sirket</h4>
              <ul className="space-y-2 text-warm-400 text-sm">
                <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkimizda</Link></li>
                <li><Link href="/iletisim" className="hover:text-white transition-colors">Iletisim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Yasal</h4>
              <ul className="space-y-2 text-warm-400 text-sm">
                <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warm-800 pt-6 text-center text-warm-500 text-xs">
            <p>© 2025 MiniMaply. Tum haklari saklidir.</p>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 z-40">
        <div className="flex justify-around items-center h-14 pb-[env(safe-area-inset-bottom)]">
          <BottomNavItem href="/" icon={<Home className="w-5 h-5" strokeWidth={2} />} label="Kesfet" active />
          <BottomNavItem href="/harita" icon={<Map className="w-5 h-5" strokeWidth={2} />} label="Harita" />
          <BottomNavItem href="/favoriler" icon={<Heart className="w-5 h-5" strokeWidth={2} />} label="Favoriler" />
          <BottomNavItem href="/profil" icon={<User className="w-5 h-5" strokeWidth={2} />} label="Profil" />
        </div>
      </nav>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={function() { setAuthModalOpen(false) }}
      />
    </div>
  )
}

// COMPONENTS

function MenuLink({ href, icon, text, onClick }: { href: string, icon: string, text: string, onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-warm-50 transition-colors min-h-[44px]"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-warm-700 text-sm">{text}</span>
    </Link>
  )
}

function FilterChip({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={'px-4 h-10 rounded-full font-medium text-sm transition-all ' +
      (active 
        ? 'bg-primary-500 text-white' 
        : 'bg-warm-100 text-warm-600 hover:bg-warm-200')
    }>
      {label}
    </button>
  )
}

function MobileEventCard({ event }: { event: typeof featuredEvents[0] }) {
  return (
    <Link 
      href="/etkinlikler"
      className="block bg-white rounded-xl p-3.5 shadow-soft border border-warm-100 w-[240px] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {event.category}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-warm-800 truncate text-sm mb-1">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-warm-500 mb-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
            <span className="truncate">{event.location}</span>
            <span>•</span>
            <span className="flex-shrink-0">{event.age}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={'font-semibold text-sm ' + (event.isFree ? 'text-primary-600' : 'text-warm-800')}>
              {event.price}
            </span>
            {event.tag === 'Bugun' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-coral-100 text-coral-700">
                {event.tag}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Step({ number, color, text }: { number: string, color: string, text: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 border border-primary-100',
    coral: 'bg-coral-50 text-coral-600 border border-coral-100',
  }
  return (
    <div className="flex items-center gap-3">
      <div className={'w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-semibold text-sm md:text-base ' + colorClasses[color]}>
        {number}
      </div>
      <span className="text-warm-700 font-medium text-sm md:text-base">{text}</span>
    </div>
  )
}

function Connector() {
  return <div className="hidden md:block w-12 h-0.5 bg-warm-200 rounded-full"></div>
}

function ValueCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 border border-primary-100',
    coral: 'bg-coral-50 text-coral-600 border border-coral-100',
  }
  return (
    <div className="text-center">
      <div className={'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 ' + colorClasses[color]}>
        {icon}
      </div>
      <h3 className="font-semibold text-base md:text-lg text-warm-800 mb-1.5">{title}</h3>
      <p className="text-warm-500 text-sm">{description}</p>
    </div>
  )
}

function BottomNavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={'flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] transition-colors ' +
        (active ? 'text-primary-600' : 'text-warm-400')
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
