/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', 'src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B0F19',
          900: '#0E131F',
          850: '#111726',
          800: '#131A2A',
          750: '#1A2235',
          700: '#222D44',
          600: '#2D3A55',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['"Vazirmatn"', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseLive: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16,185,129,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(16,185,129,0.7)' },
        },
      },
      animation: {
        pulseLive: 'pulseLive 1.5s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
