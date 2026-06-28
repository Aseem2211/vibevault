/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html","./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      colors: {
        'bv-base': '#EAE0CF',
        'bv-accent': '#126E51',
        'bv-contrast': '#E76F51',
        'bv-dark-bg': '#030104',
        'bv-dark-surface': '#1A1A1A',
        'bv-dark-text': '#E0E6ED',
        'bv-accent-2': '#00D2FF',
        'bv-foreground': '#1A2556',
        'bv-foreground-dark': '#2f3a6b',
        'bv-muted': '#E0E4FF',
        'bv-muted-2': '#4F5B81',
        'bv-light-bg': '#F8F6FF',
        'bv-pink': '#FF6B6B',
        'bv-pink-dark': '#e55a5a'
      }
    },
  },
  plugins: [],
}

