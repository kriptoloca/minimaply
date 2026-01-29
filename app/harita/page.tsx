'use client'

import dynamic from 'next/dynamic'

// Harita componentini tamamen client-side yükle
const HaritaClient = dynamic(() => import('./HaritaClient'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-warm-600">Harita yükleniyor...</p>
      </div>
    </div>
  ),
})

export default function HaritaPage() {
  return <HaritaClient />
}
