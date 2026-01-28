# 🗺️ MiniMaply

**Küçük Kaşifler, Büyük Keşifler!**

Türkiye'de 0-6 yaş arası çocuklar için etkinlik keşfetme ve rezervasyon platformu.

## 🚀 Hızlı Başlangıç

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Environment variables (.env.local)
cp .env.example .env.local
# Supabase ve diğer değerleri doldur

# 3. Çalıştır
npm run dev
```

Tarayıcıda: http://localhost:3000

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap
- **Payments:** iyzico
- **Hosting:** Vercel

## 📁 Proje Yapısı

```
minimaply/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/             # Base UI components
│   └── layout/         # Layout components
├── lib/                # Utilities
│   ├── supabase/       # Supabase client
│   └── utils.ts        # Helper functions
└── public/             # Static assets
```

## 🎨 Brand Colors

- **Primary:** #6366F1 (Indigo)
- **Secondary:** #10B981 (Emerald)
- **Accent:** #F59E0B (Amber)

## 📋 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔗 Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **iyzico Sandbox:** https://sandbox.iyzico.com

---

Built with ❤️ for Turkish families
