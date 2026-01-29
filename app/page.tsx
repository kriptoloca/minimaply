import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, Search, ArrowRight, CheckCircle, Clock, Sparkles, Map } from 'lucide-react'

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
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-100 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-18">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo-icon.png" 
                alt="MiniMaply" 
                width={32} 
                height={32}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-xl text-primary-700">MiniMaply</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/etkinlikler" className="text-warm-600 hover:text-primary-600 font-medium transition-colors">
                Etkinlikler
              </Link>
              <Link href="/harita" className="text-warm-600 hover:text-primary-600 font-medium transition-colors">
                Harita
              </Link>
              {/* CTA: "Etkinlik Bul" - MVP için uygun */}
              <Link href="/etkinlikler" className="btn-primary text-sm py-2.5 px-5">
                Etkinlik Bul
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero - Gradient: Daha teal ağırlıklı (lavender azaltıldı) */}
      <section className="relative bg-gradient-to-br from-primary-100 via-primary-200 to-primary-400 text-warm-900 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl"></div>
        
        <div className="container-wide py-16 md:py-24 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                {/* İkon stroke kalınlaştırıldı */}
                <Sparkles className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
                <span className="text-sm font-medium text-warm-700">0-6 yaş için özel</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-warm-900">
                Küçük Kaşifler,
                <span className="block text-primary-600">Büyük Keşifler!</span>
              </h1>
              
              <p className="text-lg md:text-xl text-warm-700 mb-10 leading-relaxed font-normal">
                Bugün çocuğunla ne yapacağını biz bulduk. 
                Atölye, tiyatro, müze ve daha fazlası tek bir yerde.
              </p>
              
              {/* Search Box */}
              <div className="bg-white rounded-3xl p-3 shadow-soft-lg">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    {/* İkon stroke kalınlaştırıldı */}
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <select className="w-full pl-12 pr-4 py-4 rounded-2xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none cursor-pointer transition-all">
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.name} value={city.slug}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    {/* İkon stroke kalınlaştırıldı */}
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2.5} />
                    <input 
                      type="text" 
                      placeholder="Atölye, tiyatro, müze..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-warm-50 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-warm-400 transition-all"
                    />
                  </div>
                  <button className="btn-primary whitespace-nowrap">
                    <span>Etkinlik Bul</span>
                  </button>
                </div>
              </div>

              {/* İkili CTA */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Link href="/harita" className="inline-flex items-center gap-2 text-primary-700 font-medium hover:text-primary-800 transition-colors">
                  {/* İkon stroke kalınlaştırıldı */}
                  <Map className="w-5 h-5" strokeWidth={2.5} />
                  Haritada Keşfet
                </Link>
              </div>
            </div>

            {/* Etkinlik Kartları */}
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
                          <h3 className="font-semibold text-warm-800 group-hover:text-primary-600 transition-colors truncate">
                            {event.title}
                          </h3>
                          {event.tag && (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              event.tag === 'Bugün' 
                                ? 'bg-accent-100 text-accent-700' 
                                : 'bg-primary-100 text-primary-700'
                            }`}>
                              {event.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-warm-500 font-normal">
                          <span className="flex items-center gap-1">
                            {/* İkon stroke kalınlaştırıldı */}
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
                        <span className="text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
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
        
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path d="M0 80H1440V0C1440 0 1140 60 720 60C300 60 0 0 0 0V80Z" fill="#FAFAF9"/>
          </svg>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="section-tight bg-warm-50 border-b border-warm-100">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <Step number="1" color="primary" text="Şehrini seç" />
            <Connector />
            <Step number="2" color="accent" text="Etkinliği keşfet" />
            <Connector />
            <Step number="3" color="primary" text="Hemen katıl" />
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="section bg-warm-50">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Kategoriler
            </h2>
            <p className="text-warm-500 text-lg max-w-md mx-auto font-normal">
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
                <span className="font-semibold text-warm-700 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Şehirler - Sayılar yerine güvenli metin */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Şehirler
            </h2>
            <p className="text-warm-500 text-lg max-w-md mx-auto font-normal">
              Yakınındaki etkinlikleri bul
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cities.map(city => (
              <Link 
                key={city.name}
                href={`/etkinlikler?sehir=${city.slug}`}
                className="card card-hover p-8 text-center group"
              >
                <div className="w-18 h-18 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  {/* İkon stroke kalınlaştırıldı */}
                  <MapPin className="w-8 h-8 text-primary-500" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl text-warm-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {city.name}
                </h3>
                {/* Sayı yerine güvenli metin - MVP için uygun */}
                <p className="text-warm-500 font-normal text-sm">
                  Popüler etkinlikler
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Değer Önerileri */}
      <section className="section bg-warm-50">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <ValueCard 
              icon={<Map className="w-8 h-8" strokeWidth={2.5} />}
              color="primary"
              title="Harita ile Keşfet"
              description="Yakınındaki tüm etkinlikleri harita üzerinde gör"
            />
            <ValueCard 
              icon={<Clock className="w-8 h-8" strokeWidth={2.5} />}
              color="accent"
              title="Kolay Katılım"
              description="Detayları gör, hemen iletişime geç"
            />
            <ValueCard 
              icon={<CheckCircle className="w-8 h-8" strokeWidth={2.5} />}
              color="primary"
              title="Güvenilir Mekanlar"
              description="Doğrulanmış sağlayıcılar"
            />
          </div>
        </div>
      </section>

      {/* CTA - Güvenli sosyal kanıt */}
      <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl"></div>
        
        <div className="container-wide relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* Güvenli sosyal kanıt - sayı yok */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-white/90 font-medium">
                Her gün yeni etkinlikler ekleniyor
              </span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Hemen Keşfetmeye Başla!
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed font-normal">
              Çocuğunla yapabileceğin en güzel aktiviteleri MiniMaply'de bul.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/harita" className="btn-white inline-flex items-center justify-center gap-3 text-lg">
                <Map className="w-5 h-5" strokeWidth={2.5} />
                Haritada Keşfet
              </Link>
              <Link href="/etkinlikler" className="inline-flex items-center justify-center gap-3 text-lg border-2 border-white/50 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/10 transition-colors">
                Listeyi Gör
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Koyu teal */}
      <footer className="bg-primary-900 text-white py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-5">
                <Image 
                  src="/logo-icon.png" 
                  alt="MiniMaply" 
                  width={28} 
                  height={28}
                />
                <span className="font-bold text-xl">MiniMaply</span>
              </Link>
              <p className="text-primary-200 leading-relaxed font-normal">
                Küçük Kaşifler, Büyük Keşifler!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-lg">Keşfet</h4>
              <ul className="space-y-3 text-primary-200 font-normal">
                <li><Link href="/etkinlikler" className="hover:text-white transition-colors">Etkinlikler</Link></li>
                <li><Link href="/harita" className="hover:text-white transition-colors">Harita</Link></li>
                <li><Link href="/kategoriler" className="hover:text-white transition-colors">Kategoriler</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-lg">Şirket</h4>
              <ul className="space-y-3 text-primary-200 font-normal">
                <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-lg">Yasal</h4>
              <ul className="space-y-3 text-primary-200 font-normal">
                <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
                <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 pt-8 text-center text-primary-300 font-normal">
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
    accent: 'bg-accent-100 text-accent-600',
  }
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center font-semibold text-lg`}>
        {number}
      </div>
      <span className="text-warm-700 font-medium text-lg">{text}</span>
    </div>
  )
}

function Connector() {
  return <div className="hidden md:block w-16 h-0.5 bg-warm-200 rounded-full"></div>
}

function ValueCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
  }
  return (
    <div className="text-center">
      <div className={`w-18 h-18 ${colorClasses[color as keyof typeof colorClasses]} rounded-3xl flex items-center justify-center mx-auto mb-5`}>
        {icon}
      </div>
      <h3 className="font-semibold text-xl text-warm-800 mb-3">{title}</h3>
      <p className="text-warm-500 leading-relaxed font-normal">{description}</p>
    </div>
  )
}
