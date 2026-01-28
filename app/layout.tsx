import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiniMaply - Küçük Kaşifler, Büyük Keşifler!',
  description: 'Çocuğunuz için en iyi etkinlikleri keşfedin. 0-6 yaş arası çocuklar için atölye, tiyatro, müze ve daha fazlası.',
  keywords: ['çocuk etkinlikleri', 'çocuk aktiviteleri', 'aile etkinlikleri', 'istanbul çocuk', 'ankara çocuk'],
  openGraph: {
    title: 'MiniMaply - Küçük Kaşifler, Büyük Keşifler!',
    description: 'Çocuğunuz için en iyi etkinlikleri keşfedin.',
    url: 'https://minimaply.com',
    siteName: 'MiniMaply',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
