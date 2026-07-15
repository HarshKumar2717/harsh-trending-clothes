/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8ec',
          100: '#f6efd0',
          200: '#ecdda0',
          300: '#e1c96b',
          400: '#d4af37',
          500: '#c5a028',
          600: '#a8841f',
          700: '#85671c',
          800: '#6b531d',
          900: '#5a451e',
          950: '#34260a',
        },
        ink: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#c9c9c9',
          300: '#a0a0a0',
          400: '#6f6f6f',
          500: '#4a4a4a',
          600: '#333333',
          700: '#242424',
          800: '#171717',
          900: '#0d0d0d',
          950: '#050505',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 10px 30px -10px rgba(212,175,55,0.45)',
        card: '0 12px 40px -16px rgba(0,0,0,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s infinite linear',
        'marquee': 'marquee 30s linear infinite',
        'spin-slow': 'spin-slow 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};
