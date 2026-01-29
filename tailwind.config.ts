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
        // Logo Teal - KOYULAŞTIRILDI (%20 daha koyu)
        primary: {
          50: '#F0FAF8',
          100: '#D5F2ED',
          200: '#ABE5DB',
          300: '#7AD4C5',
          400: '#4DBFAB',
          500: '#2FB7A0', // Koyulaştırıldı (eskisi #14B8A6)
          600: '#249C88', // Hover
          700: '#1D7F6F',
          800: '#186459',
          900: '#134E46',
        },
        // Mercan - Sadece "Bugün" badge için
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Sarı
        yellow: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        // Sıcak Nötr - ANA ZEMIN
        warm: {
          50: '#FAFAFA',  // Ana zemin
          100: '#F7F9FA', // Alternatif zemin
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
        display: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 10px 20px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        'glow-teal': '0 0 20px rgba(47, 183, 160, 0.15)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
