/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Bebas Neue', 'Impact', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Courier New', 'monospace'],
      },
      colors: {
        genre: {
          rock: {
            primary: '#DC2626',
            light: '#EF4444',
            dark: '#991B1B',
          },
          alternative: {
            primary: '#7C3AED',
            light: '#8B5CF6',
            dark: '#5B21B6',
          },
          hiphop: {
            primary: '#EA580C',
            light: '#F97316',
            dark: '#C2410C',
          },
          electronic: {
            primary: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0369A1',
          },
          country: {
            primary: '#D97706',
            light: '#F59E0B',
            dark: '#92400E',
          },
          jazz: {
            primary: '#4F46E5',
            light: '#6366F1',
            dark: '#3730A3',
          },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
