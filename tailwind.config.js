/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#7cc4fa',
          300: '#36a3f7',
          400: '#0f87f0',
          500: '#0369d1',
          600: '#0254aa',
          700: '#024086',
          800: '#052e63',
          900: '#031a40',
        },
        surface: {
          900: '#070b14',
          800: '#0d1220',
          700: '#12192e',
          600: '#18213c',
          500: '#1d2848',
          400: '#243050',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-brand': '0 0 30px rgba(3,105,209,0.35)',
        'glow-green': '0 0 24px rgba(34,197,94,0.25)',
        'glow-red': '0 0 24px rgba(239,68,68,0.25)',
      },
    },
  },
  plugins: [],
};
