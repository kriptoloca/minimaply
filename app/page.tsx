'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Search, ArrowRight, CheckCircle, Clock, Sparkles, Map, Menu, X, Home, Heart, User, SlidersHorizontal } from 'lucide-react'

const categories = [
  { name: 'Atölye', icon: '🎨', slug: 'atolye' },
  { name: 'Tiyatro', icon: '🎭', slug: 'tiyatro' },
  { name: 'Müzik', icon: '🎵', slug: 'muzik' },
  { name: 'Spor', icon: '⚽', slug: 'spor' },
  { name: 'Müze', icon: '🏛️', slug: 'muze' },
  { name: 'Açık Hava', icon: '🌳', slug: 'acik-hava' },
]

const cities = [
  { name: 'İstanbul', slug: 'istanbul' },
  { name: 'Ankara', slug: 'ankara' },
  { name: 'İzmir', slug: 'izmir' },
  { name: 'Bursa', slug: 'bursa' },
]

const featuredEvents = [
  { title: 'Seramik Atölyesi', category: '🎨', location: 'Kadıköy', price: '250₺', age: '3-6 yaş', tag: 'Bugün', isFree: false },
  { title: 'Çocuk Tiyatrosu', category: '🎭', location: 'Beşiktaş', price: 'Ücretsiz', age: '4-6 yaş', tag: null, isFree: true },
  { title: 'Mini Futbol Okulu', category: '⚽', location: 'Ataşehir', price: '150₺', age: '5-6 yaş', tag: 'Yarın', isFree: false },
  { title: 'Resim Kursu', category: '🎨', location: 'Şişli', price: '180₺', age: '4-6 yaş', tag: 'Bugün', isFree: false },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      
      {/* ==================== HEADER ==================== */}
      {/* Mobil: hamburger + logo + search */}
      {/* Desktop: full nav */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Hamburger - sadece mobil */}
            <button 
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-warm-600 hover:text-primary-600 transition-colors"
              aria-label="Menü"
            >
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* Logo - BÜYÜTÜLDÜ */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo-icon.png" 
                alt="MiniMaply" 
                width={40}  // 32 → 40
                height={40}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-2xl md:text-2xl text-primary-700">MiniMaply</span>
            </Link>

            {/* Search button - sadece mobil */}
            <button 
              onClick={() => setFilterOpen(true)}
              className="md:hidden p-2 -mr-2 text-warm-600 hover:text-primary-600 transition-colors"
              aria-label="Ara"
            >
              <Search className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/etkinlikler" className="text-warm-600 hover:text-primary-600 font-medium transition-colors">
                Etkinlikler
              </Link>
              <Link href="/harita" className="text-warm-600 hover:text-primary-600 font-medium transition-colors">
                Harita
              </Link>
              <Link href="/etkinlikler" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all min-h-[44px] flex items-center">
                Etkinlik Bul
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ==================== HAMBURGER MENU (Mobil) ==================== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="p-5 border-b border-warm-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                <Image src="/logo-icon.png" alt="MiniMaply" width={36} height={36} />
                <span className="font-bold text-xl text-primary-700">MiniMaply</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="p-2 text-warm-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-5 space-y-2">
              <MenuLink href="/etkinlikler" icon="📅" text="Etkinlikler" onClick={() => setMenuOpen(false)} />
              <MenuLink href="/harita" icon="🗺️" text="Harita" onClick={() => setMenuOpen(false)} />
              <MenuLink href="/kategoriler" icon="📂" text="Kategoriler" onClick={() => setMenuOpen(false)} />
              <div className="pt-4 border-t border-warm-100 mt-4">
                <p className="text-sm text-warm-400 mb-3 font-medium">Şehirler</p>
                {cities.map(city => (
                  <MenuLink key={city.slug} href={`/etkinlikler?sehir=${city.slug}`} icon="📍" text={city.name} onClick={() => setMenuOpen(false)} />
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* ==================== FILTER MODAL (Mobil) ==================== */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-auto">
            <div className="sticky top-0 bg-white p-5 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Etkinlik Ara</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 text-warm-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Şehir */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📍 Şehir</label>
                <select className="w-full p-4 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[52px]">
                  <option value="">Tüm Şehirler</option>
                  {cities.map(city => (
                    <option key={city.slug} value={city.slug}>{city.name}</option>
                  ))}
                </select>
              </div>
              {/* Kategori */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">🎨 Kategori</label>
                <select className="w-full p-4 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[52px]">
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              {/* Tarih */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📅 Ne Zaman</label>
                <div className="flex gap-3">
                  <FilterChip label="Bugün" active />
                  <FilterChip label="Yarın" />
                  <FilterChip label="Hafta Sonu" />
                </div>
              </div>
              {/* Ücretsiz */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">💸 Fiyat</label>
                <div className="flex gap-3">
                  <FilterChip label="Hepsi" active />
                  <FilterChip label="Ücretsiz" />
                </div>
              </div>
              {/* CTA */}
              <button 
                onClick={() => setFilterOpen(false)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-all min-h-[52px]"
              >
                Etkinlikleri Göster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HERO ==================== */}
      {/* Mobil ve Desktop için ayrı hero */}
      
      {/* MOBILE HERO */}
      <section className="md:hidden px-5 py-8" style={{ background: 'linear-gradient(180deg, #EAF9F6 0%, #FFFFFF 100%)' }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-warm-900 mb-3 leading-tight">
            Bugün Çocuğunla<br />
            <span className="text-primary-600">Ne Yapsan?</span>
          </h1>
          <p className="text-warm-600 text-base">
            0-6 yaş için yakın etkinlikleri keşfet
          </p>
        </div>
        
        {/* Swipeable Event Cards - Horizontal Scroll */}
        <div className="overflow-x-auto -mx-5 px-5 pb-4 scrollbar-hide">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {featuredEvents.map((event, index) => (
              <MobileEventCard key={index} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* DESKTOP HERO */}
      <section 
        className="hidden md:block relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EAF9F6 0%, #F2FBF9 50%, #FFFFFF 100%)' }}
      >
        <div className="container-wide py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary-500" strokeWidth={2.5} />
                <span className="text-sm font-medium text-primary-700">0-6 yaş için özel</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight text-warm-900">
                Küçük Kaşifler,
                <span className="block text-primary-600">Büyük Keşifler!</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-warm-600 mb-10 leading-relaxed">
                Bugün çocuğunla ne yapacağını biz bulduk. 
                Atölye, tiyatro, müze ve daha fazlası tek bir yerde.
              </p>
              
              {/* Search Box */}
              <div className="bg-white rounded-2xl p-3 shadow-soft border border-warm-100">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <select className="w-full pl-12 pr-4 py-4 rounded-xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none cursor-pointer transition-all min-h-[52px]">
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.name} value={city.slug}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <input 
                      type="text" 
                      placeholder="Atölye, tiyatro, müze..."
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-warm-400 transition-all min-h-[52px]"
                    />
                  </div>
                  <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md min-h-[52px]">
                    Etkinlik Bul
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <Link href="/harita" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  <Map className="w-5 h-5" strokeWidth={2.5} />
                  Haritada Keşfet
                </Link>
              </div>
            </div>

            {/* Desktop Event Cards */}
            <div className="hidden lg:block relative">
              <div className="space-y-5">
                {featuredEvents.slice(0, 3).map((event, index) => (
                  <Link
                    href="/etkinlikler"
                    key={index}
                    className={`block bg-white rounded-2xl p-5 shadow-soft border border-warm-100 transform ${
                      index === 0 ? 'translate-x-6 rotate-1' : 
                      index === 1 ? '-translate-x-2 -rotate-1' : 
                      'translate-x-10 rotate-1'
                    } hover:scale-[1.02] hover:shadow-soft-lg transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {event.category}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-warm-800 group-hover:text-primary-600 transition-colors truncate">
                            {event.title}
                          </h3>
                          {event.tag && (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              event.tag === 'Bugün' 
                                ? 'bg-accent-100 text-accent-700' 
                                : 'bg-primary-50 text-primary-600'
                            }`}>
                              {event.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-warm-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                            {event.location}
                          </span>
                          <span>•</span>
                          <span>{event.age}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-lg ${event.isFree ? 'text-primary-600' : 'text-warm-800'}`}>
                          {event.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NASIL ÇALIŞIR ==================== */}
      <section className="py-10 md:py-16 bg-white border-b border-warm-100">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
            <Step number="1" color="primary" text="Şehrini seç" />
            <Connector />
            <Step number="2" color="accent" text="Etkinliği keşfet" />
            <Connector />
            <Step number="3" color="primary" text="Hemen katıl" />
          </div>
        </div>
      </section>

      {/* ==================== KATEGORİLER ==================== */}
      <section className="py-12 md:py-20 bg-warm-50">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold text-warm-900 mb-3">
              Kategoriler
            </h2>
            <p className="text-warm-500 text-base md:text-lg">
              İlgi alanına göre etkinlikleri keşfet
            </p>
          </div>
          
          {/* Mobil: 3 sütun, Desktop: 6 sütun */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
            {categories.map(cat => (
              <Link 
                key={cat.slug}
                href={`/etkinlikler?kategori=${cat.slug}`}
                className="bg-white rounded-2xl p-4 md:p-6 text-center border border-warm-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary-100 transition-all group min-h-[100px] flex flex-col items-center justify-center"
              >
                <div className="text-4xl md:text-5xl mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <span className="font-semibold text-sm md:text-base text-warm-700 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ŞEHİRLER ==================== */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold text-warm-900 mb-3">
              Şehirler
            </h2>
            <p className="text-warm-500 text-base md:text-lg">
              Yakınındaki etkinlikleri bul
            </p>
          </div>
          
          {/* Mobil: 2 sütun, Desktop: 4 sütun */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {cities.map(city => (
              <Link 
                key={city.name}
                href={`/etkinlikler?sehir=${city.slug}`}
                className="bg-white rounded-2xl p-6 md:p-8 text-center border border-warm-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary-100 transition-all group min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-7 h-7 md:w-8 md:h-8 text-primary-500" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-warm-800 mb-1 group-hover:text-primary-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-warm-500 text-sm">
                  Popüler etkinlikler
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DEĞER ÖNERİLERİ ==================== */}
      <section className="py-12 md:py-20 bg-warm-50">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6 md:gap-12">
            <ValueCard 
              icon={<Map className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />}
              color="primary"
              title="Harita ile Keşfet"
              description="Yakınındaki tüm etkinlikleri harita üzerinde gör"
            />
            <ValueCard 
              icon={<Clock className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />}
              color="accent"
              title="Kolay Katılım"
              description="Detayları gör, hemen iletişime geç"
            />
            <ValueCard 
              icon={<CheckCircle className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />}
              color="primary"
              title="Güvenilir Mekanlar"
              description="Doğrulanmış sağlayıcılar"
            />
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section 
        className="py-16 md:py-24 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #249C88 0%, #2FB7A0 50%, #249C88 100%)' }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container-wide relative">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 md:mb-8">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-white/90 font-medium text-sm">
                Her gün yeni etkinlikler
              </span>
            </div>
            
            <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">
              Hemen Keşfetmeye Başla!
            </h2>
            <p className="text-base md:text-xl text-white/90 mb-8 md:mb-10 leading-relaxed">
              Çocuğunla yapabileceğin en güzel aktiviteleri MiniMaply'de bul.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/harita" className="bg-white text-primary-600 font-semibold py-4 px-6 md:px-8 rounded-xl shadow-soft hover:shadow-soft-lg transition-all inline-flex items-center justify-center gap-3 text-base md:text-lg min-h-[52px]">
                <Map className="w-5 h-5" strokeWidth={2.5} />
                Haritada Keşfet
              </Link>
              <Link href="/etkinlikler" className="border-2 border-white/30 text-white font-semibold py-4 px-6 md:px-8 rounded-xl hover:bg-white/10 transition-all inline-flex items-center justify-center gap-3 text-base md:text-lg min-h-[52px]">
                Listeyi Gör
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-primary-900 text-white py-12 md:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4 md:mb-5">
                <Image src="/logo-icon.png" alt="MiniMaply" width={32} height={32} />
                <span className="font-bold text-xl">MiniMaply</span>
              </Link>
              <p className="text-primary-200 leading-relaxed text-sm md:text-base">
                Küçük Kaşifler, Büyük Keşifler!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 md:mb-5 text-base md:text-lg">Keşfet</h4>
              <ul className="space-y-2 md:space-y-3 text-primary-200 text-sm md:text-base">
                <li><Link href="/etkinlikler" className="hover:text-white transition-colors">Etkinlikler</Link></li>
                <li><Link href="/harita" className="hover:text-white transition-colors">Harita</Link></li>
                <li><Link href="/kategoriler" className="hover:text-white transition-colors">Kategoriler</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 md:mb-5 text-base md:text-lg">Şirket</h4>
              <ul className="space-y-2 md:space-y-3 text-primary-200 text-sm md:text-base">
                <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 md:mb-5 text-base md:text-lg">Yasal</h4>
              <ul className="space-y-2 md:space-y-3 text-primary-200 text-sm md:text-base">
                <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 pt-6 md:pt-8 text-center text-primary-300 text-sm">
            <p>© 2025 MiniMaply. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* ==================== BOTTOM NAVIGATION (Mobil) ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 z-40 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          <BottomNavItem href="/" icon={<Home className="w-6 h-6" strokeWidth={2} />} label="Keşfet" active />
          <BottomNavItem href="/harita" icon={<Map className="w-6 h-6" strokeWidth={2} />} label="Harita" />
          <BottomNavItem href="/favoriler" icon={<Heart className="w-6 h-6" strokeWidth={2} />} label="Favoriler" />
          <BottomNavItem href="/profil" icon={<User className="w-6 h-6" strokeWidth={2} />} label="Profil" />
        </div>
      </nav>

      {/* ==================== STICKY CTA (Mobil - Ana sayfa dışı) ==================== */}
      {/* Bu sadece liste/detay sayfalarında görünecek - şimdilik bottom nav var */}
    </div>
  )
}

// ==================== COMPONENTS ====================

function MenuLink({ href, icon, text, onClick }: { href: string, icon: string, text: string, onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors min-h-[48px]"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-warm-700">{text}</span>
    </Link>
  )
}

function FilterChip({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-full font-medium text-sm min-h-[40px] transition-all ${
      active 
        ? 'bg-primary-500 text-white' 
        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
    }`}>
      {label}
    </button>
  )
}

function MobileEventCard({ event }: { event: typeof featuredEvents[0] }) {
  return (
    <Link 
      href="/etkinlikler"
      className="block bg-white rounded-2xl p-4 shadow-soft border border-warm-100 w-[260px] min-h-[120px] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {event.category}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-warm-800 truncate text-base">
              {event.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-warm-500 mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
            <span className="truncate">{event.location}</span>
            <span>•</span>
            <span className="flex-shrink-0">{event.age}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${event.isFree ? 'text-primary-600' : 'text-warm-800'}`}>
              {event.price}
            </span>
            {event.tag && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                event.tag === 'Bugün' 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'bg-primary-50 text-primary-600'
              }`}>
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
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border border-primary-100',
    accent: 'bg-accent-50 text-accent-600 border border-accent-100',
  }
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center font-semibold text-base md:text-lg`}>
        {number}
      </div>
      <span className="text-warm-700 font-medium text-base md:text-lg">{text}</span>
    </div>
  )
}

function Connector() {
  return <div className="hidden md:block w-16 h-0.5 bg-warm-200 rounded-full"></div>
}

function ValueCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border border-primary-100',
    accent: 'bg-accent-50 text-accent-600 border border-accent-100',
  }
  return (
    <div className="text-center">
      <div className={`w-14 h-14 md:w-16 md:h-16 ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-5`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg md:text-xl text-warm-800 mb-2 md:mb-3">{title}</h3>
      <p className="text-warm-500 leading-relaxed text-sm md:text-base">{description}</p>
    </div>
  )
}

function BottomNavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] transition-colors ${
        active ? 'text-primary-600' : 'text-warm-400 hover:text-warm-600'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
