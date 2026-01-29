import { createClient } from '@supabase/supabase-js'
import { Event, Category, City, District, EventFilters } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Kategorileri getir
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data || []
}

// Şehirleri getir
export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }
  
  return data || []
}

// İlçeleri getir
export async function getDistricts(cityId?: string): Promise<District[]> {
  let query = supabase.from('districts').select('*')
  
  if (cityId) {
    query = query.eq('city_id', cityId)
  }
  
  const { data, error } = await query.order('name')
  
  if (error) {
    console.error('Error fetching districts:', error)
    return []
  }
  
  return data || []
}

// Etkinlikleri getir (filtreleme ile)
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      district:districts(*),
      provider:providers(*)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })
  
  // Şehir filtresi
  if (filters?.city) {
    const { data: cityData } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', filters.city)
      .single()
    
    if (cityData) {
      query = query.eq('city_id', cityData.id)
    }
  }
  
  // Kategori filtresi
  if (filters?.category) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single()
    
    if (catData) {
      query = query.eq('category_id', catData.id)
    }
  }
  
  // Yaş filtresi
  if (filters?.minAge !== undefined) {
    query = query.gte('max_age', filters.minAge)
  }
  if (filters?.maxAge !== undefined) {
    query = query.lte('min_age', filters.maxAge)
  }
  
  // Ücretsiz filtresi
  if (filters?.isFree) {
    query = query.eq('is_free', true)
  }
  
  // Tarih filtresi
  if (filters?.date) {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    if (filters.date === 'today') {
      query = query.lte('start_date', todayStr).gte('end_date', todayStr)
    } else if (filters.date === 'tomorrow') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      query = query.lte('start_date', tomorrowStr).gte('end_date', tomorrowStr)
    } else if (filters.date === 'weekend') {
      // Cumartesi-Pazar
      const dayOfWeek = today.getDay()
      const saturday = new Date(today)
      saturday.setDate(today.getDate() + (6 - dayOfWeek))
      const sunday = new Date(saturday)
      sunday.setDate(saturday.getDate() + 1)
      
      query = query.lte('start_date', sunday.toISOString().split('T')[0])
    }
  }
  
  // Arama filtresi
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }
  
  const { data, error } = await query.limit(50)
  
  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  
  return data || []
}

// Tek etkinlik getir
export async function getEvent(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      district:districts(*),
      provider:providers(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching event:', error)
    return null
  }
  
  return data
}

// Öne çıkan etkinlikler
export async function getFeaturedEvents(limit = 6): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      district:districts(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('start_date', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching featured events:', error)
    return []
  }
  
  return data || []
}
