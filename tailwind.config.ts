import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 5️⃣ SURFACE - Kırık beyaz zemin
        surface: '#F7FAF9',
        
        // PRIMARY - Mint/Teal (CTA, başlık vurgusu)
        primary: {
          50: '#F0FAF8',
          100: '#D5F2ED',
          200: '#ABE5DB',
          300: '#7AD4C5',
          400: '#4DBFAB',
          500: '#2FB7A0',
          600: '#249C88',
          700: '#1D7F6F',
          800: '#186459',
          900: '#134E46',
        },
        // 5️⃣ CORAL - İkincil vurgu (fiyat, "bugün", rozet)
        coral: {
          50: '#FFF5F0',
          100: '#FFE8DD',
          200: '#FFD0BB',
          300: '#FFB088',
          400: '#FF8A55',
          500: '#F97316',
          600: '#E55E00',
          700: '#C24D00',
          800: '#9A3D00',
          900: '#7C3100',
        },
        // Sıcak Nötr - Text için
        warm: {
          50: '#FAFAFA',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 12px -3px rgba(0, 0, 0, 0.06), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 8px 30px -8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
