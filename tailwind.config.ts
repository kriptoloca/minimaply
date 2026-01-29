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
        // 5️⃣ SURFACE - Daha warm neutral
        surface: '#F8F9F8',
        
        // PRIMARY - Mint/Teal (%15 koyulaştırıldı)
        primary: {
          50: '#ECFDF8',
          100: '#D1FAE8',
          200: '#A7F3D5',
          300: '#6EE7BC',
          400: '#34D39E',
          500: '#22B88A', // Koyulaştırıldı (eski #2FB7A0)
          600: '#1A9A72', // Hover - daha koyu
          700: '#167D5E',
          800: '#14644C',
          900: '#12523F',
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
        // Sıcak Nötr - Daha warm
        warm: {
          50: '#FAFAF9',
          100: '#F5F5F3',
          200: '#E8E6E3',
          300: '#D6D3CF',
          400: '#A8A29C',
          500: '#79726B',
          600: '#5C564F',
          700: '#46423D',
          800: '#2D2A26',
          900: '#1D1B18',
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
