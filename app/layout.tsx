import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

// Nunito - next/font ile yükleme (FOIT/FOUT önlenir)
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'MiniMaply - Küçük Kaşifler, Büyük Keşifler!',
  description: '0-6 yaş arası çocuğunuz için en iyi etkinlikleri keşfedin. Atölye, tiyatro, müze ve daha fazlası.',
  keywords: ['çocuk etkinlikleri', 'aile aktiviteleri', 'çocuk atölyeleri', 'İstanbul', 'Ankara', 'İzmir', 'Bursa'],
  openGraph: {
    title: 'MiniMaply - Küçük Kaşifler, Büyük Keşifler!',
    description: '0-6 yaş arası çocuğunuz için en iyi etkinlikleri keşfedin.',
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
    <html lang="tr" className={nunito.variable}>
      <body className={nunito.className}>{children}</body>
    </html>
  )
}
