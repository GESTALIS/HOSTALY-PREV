/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs HOTALY personnalisées
        'hotaly': {
          'primary': '#004b5d',
          'primary-light': '#006d8a',
          'primary-dark': '#003a4a',
          'secondary': '#f89032',
          'secondary-light': '#faa052',
          'secondary-dark': '#e67a1a',
          'accent': '#eca08e',
          'accent-light': '#f0b8a3',
          'accent-dark': '#e0886f',
          'tertiary': '#ba8a36',
          'tertiary-light': '#d4a04a',
          'tertiary-dark': '#a67a2a',
          'neutral': '#ededed',
          'neutral-light': '#f5f5f5',
          'neutral-dark': '#d4d4d4',
        },
        // Couleurs utilitaires
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      fontFamily: {
        'hotaly': ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        'hotaly-xs': '0.25rem',
        'hotaly-sm': '0.5rem',
        'hotaly-md': '1rem',
        'hotaly-lg': '1.5rem',
        'hotaly-xl': '2rem',
        'hotaly-2xl': '3rem',
      },
      boxShadow: {
        'hotaly-sm': '0 1px 2px 0 rgba(0, 75, 93, 0.05)',
        'hotaly-md': '0 4px 6px -1px rgba(0, 75, 93, 0.1)',
        'hotaly-lg': '0 10px 15px -3px rgba(0, 75, 93, 0.1)',
        'hotaly-xl': '0 20px 25px -5px rgba(0, 75, 93, 0.1)',
      },
      borderRadius: {
        'hotaly-sm': '0.25rem',
        'hotaly-md': '0.5rem',
        'hotaly-lg': '0.75rem',
        'hotaly-xl': '1rem',
        'hotaly-full': '9999px',
      },
      transitionDuration: {
        'hotaly-fast': '150ms',
        'hotaly-normal': '250ms',
        'hotaly-slow': '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
