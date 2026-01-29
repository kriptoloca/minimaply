'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, List, Filter, X, Home, Calendar, Map, Heart, Clock, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import 'leaflet/dist/leaflet.css'

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Event {
  id: string
  title: string
  slug: string
  lat: number
  lng: number
  min_age: number
  max_age: number
  price: number
  is_free: boolean
  start_time: string
  is_featured: boolean
  source_type?: string
  category?: { name: string; slug: string; icon: string }
  city?: { name: string; slug: string }
  district?: { name: string; slug: string }
}

interface Category {
  slug: string
  name: string
  icon: string
}

interface City {
  slug: string
  name: string
}

const categories: Category[] = [
  { slug: 'atolye', name: 'Atölye', icon: '🎨' },
  { slug: 'tiyatro', name: 'Tiyatro', icon: '🎭' },
  { slug: 'muzik', name: 'Müzik', icon: '🎵' },
  { slug: 'spor', name: 'Spor', icon: '⚽' },
  { slug: 'muze', name: 'Müze', icon: '🏛️' },
  { slug: 'acik-hava', name: 'Açık Hava', icon: '🌳' },
]

const cities: City[] = [
  { slug: 'istanbul', name: 'İstanbul' },
  { slug: 'ankara', name: 'Ankara' },
  { slug: 'izmir', name: 'İzmir' },
  { slug: 'bursa', name: 'Bursa' },
]

const cityCoords: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4237, 27.1428],
  bursa: [40.1827, 29.0612],
}

export default function HaritaClient() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  
  const [selectedCity, setSelectedCity] = useState(searchParams.get('sehir') || 'istanbul')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('kategori') || '')
  const [isFreeOnly, setIsFreeOnly] = useState(false)

  const urlLat = searchParams.get('lat')
  const urlLng = searchParams.get('lng')
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    urlLat && urlLng 
      ? [parseFloat(urlLat), parseFloat(urlLng)]
      : cityCoords[selectedCity] || cityCoords.istanbul
  )
  const [mapZoom, setMapZoom] = useState(urlLat ? 15 : 12)

  useEffect(() => {
    if (!urlLat && cityCoords[selectedCity]) {
      setMapCenter(cityCoords[selectedCity])
      setMapZoom(12)
    }
  }, [selectedCity, urlLat])

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      
      let query = supabase
        .from('events')
        .select(`
          id, title, slug, lat, lng, min_age, max_age, price, is_free, start_time, is_featured, source_type,
          category:categories(name, slug, icon),
          city:cities(name, slug),
          district:districts(name, slug)
        `)
        .eq('is_active', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)

      if (selectedCity) {
        const { data: cityData } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', selectedCity)
          .single()
        
        if (cityData) {
          query = query.eq('city_id', cityData.id)
        }
      }

      if (selectedCategory) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single()
        
        if (catData) {
          query = query.eq('category_id', catData.id)
        }
      }

      if (isFreeOnly) {
        query = query.eq('is_free', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } else {
        const fixed = (data || []).map(e => ({
          ...e,
          category: Array.isArray(e.category) ? e.category[0] : e.category,
          city: Array.isArray(e.city) ? e.city[0] : e.city,
          district: Array.isArray(e.district) ? e.district[0] : e.district,
        }))
        setEvents(fixed)
      }
      
      setLoading(false)
    }

    fetchEvents()
  }, [selectedCity, selectedCategory, isFreeOnly])

  const activeFilterCount = [selectedCategory, isFreeOnly].filter(Boolean).length

  return (
    <div className="fixed inset-0 flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-warm-100 z-50 flex-shrink-0">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary-700">MiniMaply</span>
            </Link>

            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-10 px-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-700 font-medium text-sm"
              >
                {cities.map(city => (
                  <option key={city.slug} value={city.slug}>{city.name}</option>
                ))}
              </select>

              <button
                onClick={() => setFilterOpen(true)}
                className={`h-10 px-3 rounded-xl font-medium flex items-center gap-1.5 text-sm ${
                  activeFilterCount > 0
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-50 border border-warm-200 text-warm-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
              </button>

              <Link
                href="/etkinlikler"
                className="h-10 px-3 rounded-xl bg-warm-50 border border-warm-200 text-warm-600 font-medium flex items-center gap-1.5 text-sm"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Harita */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {events.map(event => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            />
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-warm-600">Yükleniyor...</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1.5 shadow-md text-sm font-medium text-warm-700 z-10">
          {events.length} etkinlik
        </div>

        {selectedEvent && (
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20">
            <div className="bg-white rounded-2xl shadow-xl border border-warm-100 overflow-hidden">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-2 right-2 p-1.5 bg-warm-100 rounded-full text-warm-500 hover:bg-warm-200 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <Link href={`/etkinlikler/${selectedEvent.slug}`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {selectedEvent.category?.icon || '🎉'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary-600">{selectedEvent.category?.name}</span>
                        {selectedEvent.is_featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">⭐</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-warm-800 truncate">{selectedEvent.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-warm-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{selectedEvent.district?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
                    <div className="flex items-center gap-3 text-sm text-warm-500">
                      <span>👶 {selectedEvent.min_age}-{selectedEvent.max_age} yaş</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedEvent.start_time?.slice(0, 5)}
                      </span>
                    </div>
                    <span className={`font-semibold ${selectedEvent.is_free ? 'text-primary-600' : 'text-warm-800'}`}>
                      {selectedEvent.is_free ? 'Ücretsiz' : `${selectedEvent.price}₺`}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-center gap-1 text-primary-600 text-sm font-medium">
                    Detayları Gör <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Filtre Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full md:w-96 bg-white rounded-t-3xl md:rounded-2xl shadow-xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-warm-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-warm-800">Filtrele</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 text-warm-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">🎨 Kategori</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      !selectedCategory ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                    }`}
                  >
                    Hepsi
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.slug ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-warm-600 mb-2 block">💸 Fiyat</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFreeOnly(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      !isFreeOnly ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                    }`}
                  >
                    Hepsi
                  </button>
                  <button
                    onClick={() => setIsFreeOnly(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isFreeOnly ? 'bg-primary-500 text-white' : 'bg-warm-100 text-warm-600'
                    }`}
                  >
                    Ücretsiz
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-warm-100">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full h-12 bg-primary-500 text-white font-semibold rounded-xl"
              >
                {events.length} Etkinlik Göster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="md:hidden bg-white border-t border-warm-100 z-40 flex-shrink-0">
        <div className="flex justify-around items-center h-14 pb-[env(safe-area-inset-bottom)]">
          <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Ana Sayfa" active={pathname === '/'} />
          <NavItem href="/etkinlikler" icon={<Calendar className="w-5 h-5" />} label="Etkinlikler" active={pathname?.startsWith('/etkinlikler')} />
          <NavItem href="/harita" icon={<Map className="w-5 h-5" />} label="Harita" active={pathname === '/harita'} />
          <NavItem href="/favoriler" icon={<Heart className="w-5 h-5" />} label="Favoriler" active={pathname === '/favoriler'} />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 min-w-[60px] ${active ? 'text-primary-600' : 'text-warm-400'}`}>
      <div className="relative">
        {icon}
        {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
