'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Search, Filter, X, Calendar, Clock, Home, Map, Heart, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Types
interface Event {
  id: string
  title: string
  slug: string
  description?: string
  category_id: string
  city_id: string
  district_id: string
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
  is_featured: boolean
  category?: { id: string; name: string; slug: string; icon: string }
  city?: { id: string; name: string; slug: string }
  district?: { id: string; name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

interface City {
  id: string
  name: string
  slug: string
}

const categories: Category[] = [
  { id: '1', slug: 'atolye', name: 'Atölye', icon: '🎨' },
  { id: '2', slug: 'tiyatro', name: 'Tiyatro', icon: '🎭' },
  { id: '3', slug: 'muzik', name: 'Müzik', icon: '🎵' },
  { id: '4', slug: 'spor', name: 'Spor', icon: '⚽' },
  { id: '5', slug: 'muze', name: 'Müze', icon: '🏛️' },
  { id: '6', slug: 'acik-hava', name: 'Açık Hava', icon: '🌳' },
]

const cities: City[] = [
  { id: '1', slug: 'istanbul', name: 'İstanbul' },
  { id: '2', slug: 'ankara', name: 'Ankara' },
  { id: '3', slug: 'izmir', name: 'İzmir' },
  { id: '4', slug: 'bursa', name: 'Bursa' },
]

export default function EtkinliklerPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filtreler
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('') // 'today' | 'weekend' | 'week' | ''
  const [isFreeOnly, setIsFreeOnly] = useState(false)

  // Scroll lock
  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  // Supabase'den etkinlikleri çek
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name, slug, icon),
          city:cities(id, name, slug),
          district:districts(id, name, slug)
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } else {
        setEvents(data || [])
      }
      
      setLoading(false)
    }

    fetchEvents()
  }, [])

  // Client-side filtreleme
  const filteredEvents = events.filter(event => {
    // Şehir filtresi
    if (selectedCity && event.city?.slug !== selectedCity) return false
    
    // Kategori filtresi
    if (selectedCategory && event.category?.slug !== selectedCategory) return false
    
    // Ücretsiz filtresi
    if (isFreeOnly && !event.is_free) return false
    
    // Arama filtresi
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    // Tarih filtresi
    if (selectedDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const eventStart = new Date(event.start_date)
      const eventEnd = new Date(event.end_date)
      
      if (selectedDate === 'today') {
        // Bugün: etkinlik bugün aktif mi?
        const todayStr = today.toISOString().split('T')[0]
        if (event.start_date > todayStr || event.end_date < todayStr) return false
      } else if (selectedDate === 'weekend') {
        // Hafta sonu: Cumartesi veya Pazar
        const dayOfWeek = today.getDay()
        const saturday = new Date(today)
        saturday.setDate(today.getDate() + (6 - dayOfWeek))
        const sunday = new Date(saturday)
        sunday.setDate(saturday.getDate() + 1)
        
        const saturdayStr = saturday.toISOString().split('T')[0]
        const sundayStr = sunday.toISOString().split('T')[0]
        
        // Etkinlik hafta sonunu kapsıyor mu?
        const coversWeekend = (event.start_date <= sundayStr && event.end_date >= saturdayStr)
        if (!coversWeekend) return false
      } else if (selectedDate === 'week') {
        // Bu hafta: bugünden 7 gün içinde
        const weekLater = new Date(today)
        weekLater.setDate(today.getDate() + 7)
        const weekLaterStr = weekLater.toISOString().split('T')[0]
        const todayStr = today.toISOString().split('T')[0]
        
        // Etkinlik bu haftayı kapsıyor mu?
        const coversWeek = (event.start_date <= weekLaterStr && event.end_date >= todayStr)
        if (!coversWeek) return false
      }
    }
    
    return true
  })

  // Aktif filtre sayısı
  const activeFilterCount = [selectedCity, selectedCategory, selectedDate, isFreeOnly].filter(Boolean).length

  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedCity('')
    setSelectedCategory('')
    setSelectedDate('')
    setIsFreeOnly(false)
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-surface pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
      
      {/* Header */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 md:h-20">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group">
              <Image 
                src="/logo-icon.png" 
                alt="MiniMaply" 
                width={150}
                height={150}
                className="w-auto h-10 md:h-14 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-xl md:text-2xl text-primary-700">MiniMaply</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/etkinlikler" className="text-primary-600 font-medium">
                Etkinlikler
              </Link>
              <Link href="/harita" className="text-warm-600 hover:text-primary-600 font-medium transition-colors">
                Harita
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title + Search */}
      <div className="bg-white border-b border-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-warm-900">Etkinlikler</h1>
              <p className="text-sm text-warm-500 mt-0.5">
                {loading ? 'Yükleniyor...' : `${filteredEvents.length} etkinlik bulundu`}
              </p>
            </div>

            {/* Desktop Search & Filter */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Etkinlik ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 w-64 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 placeholder:text-warm-400 transition-all"
                />
              </div>
              
              {/* Desktop Filters */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-11 px-4 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map(city => (
                  <option key={city.slug} value={city.slug}>{city.name}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 px-4 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>

              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Tüm Tarihler</option>
                <option value="today">Bugün</option>
                <option value="weekend">Hafta Sonu</option>
                <option value="week">Bu Hafta</option>
              </select>

              <button
                onClick={() => setIsFreeOnly(!isFreeOnly)}
                className={`h-11 px-4 rounded-xl font-medium transition-all ${
                  isFreeOnly
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-50 border border-warm-200 text-warm-600 hover:bg-warm-100'
                }`}
              >
                Ücretsiz
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="h-11 px-4 rounded-xl text-warm-500 hover:text-warm-700 font-medium transition-colors"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5" strokeWidth={2} />
              <input
                type="text"
                placeholder="Etkinlik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 w-full rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-warm-400 transition-all"
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={`h-11 px-4 rounded-xl font-medium flex items-center gap-2 transition-all ${
                activeFilterCount > 0
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-warm-200 text-warm-600'
              }`}
            >
              <Filter className="w-5 h-5" strokeWidth={2} />
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Filtrele</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 text-warm-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {/* Şehir */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📍 Şehir</label>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[48px]"
                >
                  <option value="">Tüm Şehirler</option>
                  {cities.map(city => (
                    <option key={city.slug} value={city.slug}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">🎨 Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium min-h-[48px]"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tarih - Preset buttons */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">📅 Ne Zaman</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '', label: 'Hepsi' },
                    { value: 'today', label: 'Bugün' },
                    { value: 'weekend', label: 'Hafta Sonu' },
                    { value: 'week', label: 'Bu Hafta' },
                  ].map(date => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`px-4 h-10 rounded-full font-medium text-sm transition-all ${
                        selectedDate === date.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-warm-100 text-warm-600'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ücretsiz */}
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">💸 Fiyat</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFreeOnly(false)}
                    className={`px-4 h-10 rounded-full font-medium text-sm transition-all ${
                      !isFreeOnly ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                    }`}
                  >
                    Hepsi
                  </button>
                  <button
                    onClick={() => setIsFreeOnly(true)}
                    className={`px-4 h-10 rounded-full font-medium text-sm transition-all ${
                      isFreeOnly ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                    }`}
                  >
                    Ücretsiz
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Buttons */}
            <div className="flex-shrink-0 p-4 border-t border-warm-100 bg-white flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 h-12 rounded-xl border border-warm-200 text-warm-600 font-semibold hover:bg-warm-50 transition-colors"
              >
                Temizle
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-[2] h-12 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
              >
                {filteredEvents.length} Etkinlik Göster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-warm-100 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-warm-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-warm-100 rounded w-3/4" />
                  <div className="h-3 bg-warm-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-warm-800 mb-2">Etkinlik bulunamadı</h3>
            <p className="text-warm-500 mb-4">Filtreleri değiştirmeyi deneyin</p>
            <button
              onClick={clearFilters}
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/etkinlikler/${event.slug}`}
      className="bg-white rounded-xl border border-warm-100 shadow-soft overflow-hidden md:hover:shadow-soft-lg md:hover:-translate-y-1 transition-all group"
    >
      {/* Image Area */}
      <div className="aspect-[16/10] bg-gradient-to-b from-primary-50 via-primary-100 to-primary-200/50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)"/%3E%3C/svg%3E")' }} />
        
        <span className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {event.category?.icon || '🎉'}
        </span>
        <span className="text-sm font-medium text-primary-700/70">{event.category?.name}</span>
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-3 px-4">
          <h3 className="font-semibold text-warm-800 text-center truncate">{event.title}</h3>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {event.is_featured && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              ⭐ Öne Çıkan
            </span>
          )}
          {event.is_free && (
            <span className="bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary-200">
              Ücretsiz
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-sm text-warm-500 mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span className="truncate">{event.district?.name}, {event.city?.name}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-warm-500 mb-3">
          <span>👶</span>
          <span>{event.min_age}-{event.max_age} yaş</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-warm-100">
          <div className="flex items-center gap-1.5 text-sm text-warm-500">
            <Clock className="w-4 h-4" strokeWidth={2} />
            <span>{event.start_time?.slice(0, 5)}</span>
          </div>
          <div className={`font-semibold ${event.is_free ? 'text-primary-600' : 'text-warm-800'}`}>
            {event.is_free ? 'Ücretsiz' : `${event.price}₺`}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Bottom Nav
function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 z-40">
      <div className="flex justify-around items-center h-14 pb-[env(safe-area-inset-bottom)]">
        <BottomNavItem href="/" icon={<Home className="w-5 h-5" strokeWidth={2} />} label="Ana Sayfa" active={pathname === '/'} />
        <BottomNavItem href="/etkinlikler" icon={<Calendar className="w-5 h-5" strokeWidth={2} />} label="Etkinlikler" active={pathname?.startsWith('/etkinlikler')} />
        <BottomNavItem href="/harita" icon={<Map className="w-5 h-5" strokeWidth={2} />} label="Harita" active={pathname === '/harita'} />
        <BottomNavItem href="/favoriler" icon={<Heart className="w-5 h-5" strokeWidth={2} />} label="Favoriler" active={pathname === '/favoriler'} />
      </div>
    </nav>
  )
}

function BottomNavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] transition-all duration-200 ${
        active ? 'text-primary-600 scale-105' : 'text-warm-400 hover:text-warm-500'
      }`}
    >
      <div className="relative">
        {icon}
        {active && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
        )}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
    </Link>
  )
}
