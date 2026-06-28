/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./vibevault/app/customer/view/**/*.{html,ejs,js}",
    "./vibevault/app/seller/view/**/*.{html,ejs,js}",
    "./app/customer/view/input.css",
    "./appback/app.js",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,jsx}",
  ],
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



