import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: {
    default: 'MiniMaply - Çocuk Etkinlikleri',
    template: '%s | MiniMaply'
  },
  description: 'Türkiye\'nin en kapsamlı çocuk etkinlikleri platformu. 0-6 yaş çocuklar için atölyeler, tiyatrolar, spor aktiviteleri ve daha fazlası.',
  keywords: ['çocuk etkinlikleri', 'çocuk atölyesi', 'çocuk tiyatrosu', 'bebek aktiviteleri', 'İstanbul çocuk', 'Ankara çocuk'],
  authors: [{ name: 'MiniMaply' }],
  creator: 'MiniMaply',
  
  // Open Graph - Facebook, WhatsApp, LinkedIn
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://minimaply.vercel.app',
    siteName: 'MiniMaply',
    title: 'MiniMaply - Çocuk Etkinlikleri',
    description: 'Türkiye\'nin en kapsamlı çocuk etkinlikleri platformu. Küçük Kaşifler, Büyük Keşifler!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MiniMaply - Çocuk Etkinlikleri',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'MiniMaply - Çocuk Etkinlikleri',
    description: 'Türkiye\'nin en kapsamlı çocuk etkinlikleri platformu.',
    images: ['/og-image.png'],
  },
  
  // Diğer
  robots: {
    index: true,
    follow: true,
  },
  
  // iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MiniMaply',
  },
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  
  // Theme
  themeColor: '#22B88A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
