/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0B10',
          surface: '#11131B',
          card: '#161924',
          cardHover: '#1D2130',
          border: '#232738',
          borderSubtle: '#1C2030'
        },
        purple: {
          glow: '#7C3AED',
          accent: '#8B5CF6',
          light: '#A78BFA',
          subtle: 'rgba(139, 92, 246, 0.1)'
        },
        difficulty: {
          easy: '#10B981',
          medium: '#F59E0B',
          hard: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'purple-glow': '0 0 25px rgba(124, 58, 237, 0.25)',
        'card-glow': '0 4px 20px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}

