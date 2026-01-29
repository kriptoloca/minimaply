// MiniMaply Types

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export interface City {
  id: string
  name: string
  slug: string
}

export interface District {
  id: string
  city_id: string
  name: string
  slug: string
}

export interface Provider {
  id: string
  name: string
  slug: string
  description?: string
  email?: string
  phone?: string
  website?: string
  logo_url?: string
  is_verified: boolean
}

// Source types
export type SourceType = 'verified' | 'sourced' | 'community'
export type BookingType = 'none' | 'external' | 'minimaply'
export type EventStatus = 'active' | 'unverified' | 'expired' | 'removed'

export interface Event {
  id: string
  title: string
  slug: string
  description?: string
  
  category_id: string
  city_id: string
  district_id: string
  provider_id?: string
  
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
  registered_count?: number
  is_active: boolean
  is_featured: boolean
  
  // Source & Booking
  source_type: SourceType
  source_url?: string
  booking_type: BookingType
  booking_url?: string
  status: EventStatus
  
  image_url?: string
  gallery_urls?: string[]
  
  created_at: string
  updated_at: string
  
  // Joined data
  category?: Category
  city?: City
  district?: District
  provider?: Provider
}

export interface EventFilters {
  city?: string
  category?: string
  minAge?: number
  maxAge?: number
  isFree?: boolean
  date?: 'today' | 'weekend' | 'week' | 'all'
  search?: string
  sourceType?: SourceType
}
