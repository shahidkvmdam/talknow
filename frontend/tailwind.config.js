/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        dark: '#075E54',
        light: '#DCF8C6',
        background: '#111b21',
        surface: '#202c33',
        chat: '#2a3942'
      }
    },
  },
  plugins: [],
}
