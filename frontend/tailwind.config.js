/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-primary': '#1A365D',
        'pearl-bg': '#F8FAFC',
        'charcoal-text': '#334155',
        'gold-accent': '#D4AF37',
      },
      fontFamily: {
        'heading': ['Merriweather', 'serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}