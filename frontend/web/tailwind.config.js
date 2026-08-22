/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        street: {
          bg: '#0F0F12',
          card: '#18181C',
          border: '#27272A',
          yellow: '#FACC15',
          orange: '#FF5722',
          text: '#F4F4F5',
          muted: '#A1A1AA',
        }
      }
    },
  },
  plugins: [],
}