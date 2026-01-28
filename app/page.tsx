import Link from 'next/link'
import { MapPin, Calendar, Search, ArrowRight, CheckCircle, Clock, Sparkles } from 'lucide-react'

const categories = [
  { name: 'Atölye', icon: '🎨', slug: 'atolye', count: 42 },
  { name: 'Tiyatro', icon: '🎭', slug: 'tiyatro', count: 28 },
  { name: 'Müzik', icon: '🎵', slug: 'muzik', count: 35 },
  { name: 'Spor', icon: '⚽', slug: 'spor', count: 51 },
  { name: 'Müze', icon: '🏛️', slug: 'muze', count: 23 },
  { name: 'Açık Hava', icon: '🌳', slug: 'acik-hava', count: 38 },
]

const cities = [
  { name: 'İstanbul', count: 150 },
  { name: 'Ankara', count: 80 },
  { name: 'İzmir', count: 60 },
  { name: 'Bursa', count: 45 },
]

const featuredEvents = [
  { title: 'Seramik Atölyesi', category: '🎨', location: 'Kadıköy', price: '250₺', age: '3-6 yaş', tag: 'Bugün', isFree: false },
  { title: 'Çocuk Tiyatrosu', category: '🎭', location: 'Beşiktaş', price: 'Ücretsiz', age: '4-6 yaş', tag: null, isFree: true },
  { title: 'Mini Futbol Okulu', category: '⚽', location: 'Ataşehir', price: '150₺', age: '5-6 yaş', tag: 'Yarın', isFree: false },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header - Minimal, temiz */}
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-100 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-18">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
              <span className="font-display font-extrabold text-xl text-primary-600">MiniMaply</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/etkinlikler" className="text-warm-600 hover:text-primary-600 font-semibold transition-colors">
                Etkinlikler
              </Link>
              <Link href="/harita" className="text-warm-600 hover:text-primary-600 font-semibold transition-colors">
                Harita
              </Link>
              <Link href="/etkinlikler" className="btn-primary text-sm py-2.5 px-5">
                Rezervasyon Yap
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero - Sıcak gradient, daha fazla nefes alanı */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-400 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl"></div>
        
        <div className="container-wide py-16 md:py-24 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Sol - Metin */}
            <div className="max-w-xl">
              {/* Tagline - soft badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-accent-300" />
                <span className="text-sm font-semibold text-white/90">0-6 yaş için özel</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Küçük Kaşifler,
                <span className="block text-accent-200">Büyük Keşifler!</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                Bugün çocuğunla ne yapacağını biz bulduk. 
                Atölye, tiyatro, müze ve daha fazlası tek bir yerde.
              </p>
              
              {/* Search Box - Yumuşak, geniş */}
              <div className="bg-white rounded-3xl p-3 shadow-soft-lg">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" />
                    <select className="w-full pl-12 pr-4 py-4 rounded-2xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none cursor-pointer transition-all">
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.name} value={city.name.toLowerCase()}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Atölye, tiyatro, müze..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-warm-400 transition-all"
                    />
                  </div>
                  <button className="btn-primary whitespace-nowrap">
                    <Search className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Etkinlik Bul</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sağ - Etkinlik kartları preview */}
            <div className="hidden lg:block relative">
              <div className="space-y-5">
                {featuredEvents.map((event, index) => (
                  <Link
                    href="/etkinlikler"
                    key={index}
                    className={`block bg-white rounded-3xl p-5 shadow-soft transform ${
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
                          <h3 className="font-bold text-warm-800 group-hover:text-primary-600 transition-colors truncate">
                            {event.title}
                          </h3>
                          {event.tag && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              event.tag === 'Bugün' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-sky-50 text-sky-600'
                            }`}>
                              {event.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-warm-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                          <span>•</span>
                          <span>{event.age}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${event.isFree ? 'text-emerald-600' : 'text-primary-600'}`}>
                          {event.price}
                        </div>
                        <span className="text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          Detaylar →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave - daha yumuşak geçiş */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path d="M0 80H1440V0C1440 0 1140 60 720 60C300 60 0 0 0 0V80Z" fill="#FAFAF9"/>
          </svg>
        </div>
      </section>

      {/* Nasıl Çalışır - 3 adım, net ve basit */}
      <section className="section-tight bg-warm-50 border-b border-warm-100">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <Step number="1" color="primary" text="Şehrini seç" />
            <Connector />
            <Step number="2" color="secondary" text="Etkinliği keşfet" />
            <Connector />
            <Step number="3" color="accent" text="Hemen rezervasyon yap" />
          </div>
        </div>
      </section>

      {/* Kategoriler - Kart bazlı, hover'da sayı */}
      <section className="section bg-warm-50">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-warm-900 mb-4">
              Kategoriler
            </h2>
            <p className="text-warm-500 text-lg max-w-md mx-auto">
              İlgi alanına göre etkinlikleri keşfet
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map(cat => (
              <Link 
                key={cat.slug}
                href={`/etkinlikler?kategori=${cat.slug}`}
                className="card card-hover p-6 text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <span className="font-bold text-warm-700 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
                <p className="text-sm text-warm-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cat.count} etkinlik
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Şehirler - Bugün X+ etkinlik */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-warm-900 mb-4">
              Şehirler
            </h2>
            <p className="text-warm-500 text-lg max-w-md mx-auto">
              Yakınındaki etkinlikleri bul
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cities.map(city => (
              <Link 
                key={city.name}
                href={`/etkinlikler?sehir=${city.name.toLowerCase()}`}
                className="card card-hover p-8 text-center group"
              >
                <div className="w-18 h-18 bg-gradient-to-br from-primary-100 to-secondary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-warm-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-warm-500 font-medium">
                  Bugün <span className="text-primary-600 font-bold">{city.count}+</span> etkinlik
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Değer Önerileri - 3 ikon */}
      <section className="section bg-warm-50">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <ValueCard 
              icon={<MapPin className="w-8 h-8" />}
              color="secondary"
              title="Harita ile Keşfet"
              description="Yakınındaki tüm etkinlikleri harita üzerinde gör"
            />
            <ValueCard 
              icon={<Clock className="w-8 h-8" />}
              color="accent"
              title="Kolay Rezervasyon"
              description="Tek tıkla rezervasyon yap, QR kodunla giriş yap"
            />
            <ValueCard 
              icon={<CheckCircle className="w-8 h-8" />}
              color="primary"
              title="Güvenilir Mekanlar"
              description="Belediye & doğrulanmış sağlayıcılar"
            />
          </div>
        </div>
      </section>

      {/* CTA - Sosyal kanıt dahil */}
      <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-400 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl"></div>
        
        <div className="container-wide relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* Sosyal kanıt */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex -space-x-3">
                {['👩', '👨', '👩', '👨', '👩'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-white/90 font-semibold">
                İstanbul'da 500+ aile kullanıyor
              </span>
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-6">
              Bugünkü Etkinlikleri Keşfet!
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Binlerce aile çocukları için en iyi etkinlikleri MiniMaply'de buluyor.
            </p>
            <Link href="/etkinlikler" className="btn-white inline-flex items-center gap-3 text-lg">
              Yakındaki Etkinlikleri Gör
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-white py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <span className="text-2xl">🗺️</span>
                <span className="font-display font-extrabold text-xl">MiniMaply</span>
              </Link>
              <p className="text-warm-400 leading-relaxed">
                Küçük Kaşifler, Büyük Keşifler!
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Keşfet</h4>
              <ul className="space-y-3 text-warm-400">
                <li><Link href="/etkinlikler" className="hover:text-white transition-colors">Etkinlikler</Link></li>
                <li><Link href="/harita" className="hover:text-white transition-colors">Harita</Link></li>
                <li><Link href="/kategoriler" className="hover:text-white transition-colors">Kategoriler</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Şirket</h4>
              <ul className="space-y-3 text-warm-400">
                <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Yasal</h4>
              <ul className="space-y-3 text-warm-400">
                <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
                <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warm-800 pt-8 text-center text-warm-500">
            <p>© 2025 MiniMaply. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Components

function Step({ number, color, text }: { number: string, color: string, text: string }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    accent: 'bg-accent-100 text-accent-600',
  }
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center font-bold text-lg`}>
        {number}
      </div>
      <span className="text-warm-700 font-semibold text-lg">{text}</span>
    </div>
  )
}

function Connector() {
  return <div className="hidden md:block w-16 h-0.5 bg-warm-200 rounded-full"></div>
}

function ValueCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    accent: 'bg-accent-100 text-accent-600',
  }
  return (
    <div className="text-center">
      <div className={`w-18 h-18 ${colorClasses[color as keyof typeof colorClasses]} rounded-3xl flex items-center justify-center mx-auto mb-5`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl text-warm-800 mb-3">{title}</h3>
      <p className="text-warm-500 leading-relaxed">{description}</p>
    </div>
  )
}
