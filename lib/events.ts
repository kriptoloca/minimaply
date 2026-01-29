import { supabase } from './supabase'

// Kategorileri getir
export async function getCategories() {
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
export async function getCities() {
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

// Tek etkinlik getir (slug ile)
export async function getEvent(slug: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      city:cities(id, name, slug),
      district:districts(id, name, slug),
      provider:providers(id, name, phone, email, is_verified)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  
  if (error) {
    console.error('Error fetching event:', error)
    return null
  }
  
  return data
}

// Öne çıkan etkinlikler
export async function getFeaturedEvents(limit = 6) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      city:cities(id, name, slug),
      district:districts(id, name, slug)
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('start_date', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching featured events:', error)
    return []
  }
  
  return data || []
}
