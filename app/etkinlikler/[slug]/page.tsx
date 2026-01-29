import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import EventDetailClient from './EventDetailClient'

interface Props {
  params: { slug: string }
}

// Dinamik OG tags için metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: event } = await supabase
    .from('events')
    .select(`
      title, description, price, is_free, min_age, max_age,
      category:categories(name, icon),
      city:cities(name),
      district:districts(name)
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!event) {
    return {
      title: 'Etkinlik Bulunamadı',
      description: 'Bu etkinlik mevcut değil veya kaldırılmış olabilir.'
    }
  }

  const title = `${event.title} | MiniMaply`
  const description = event.description 
    || `${event.category?.icon} ${event.category?.name} etkinliği - ${event.district?.name}, ${event.city?.name}. ${event.min_age}-${event.max_age} yaş için. ${event.is_free ? 'Ücretsiz' : `${event.price}₺`}`

  return {
    title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'article',
      locale: 'tr_TR',
      siteName: 'MiniMaply',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default function EventDetailPage({ params }: Props) {
  return <EventDetailClient slug={params.slug} />
}
