import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export type City = {
  id: string
  name: string
  slug: string
  lat: number
  lng: number
  is_active: boolean
  is_coming_soon: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  sort_order: number
  is_active: boolean
}

export type Event = {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  category_id: string
  provider_id?: string
  city_id: string
  venue_name: string
  venue_address?: string
  lat?: number
  lng?: number
  min_age: number
  max_age: number
  price?: number
  is_free: boolean
  image_url?: string
  status: 'draft' | 'pending' | 'active' | 'cancelled' | 'completed'
  is_featured: boolean
  created_at: string
  // Joined data
  category?: Category
  city?: City
}

export type Session = {
  id: string
  event_id: string
  date: string
  start_time: string
  end_time?: string
  capacity: number
  available: number
  price_override?: number
  status: 'scheduled' | 'cancelled' | 'completed'
}
