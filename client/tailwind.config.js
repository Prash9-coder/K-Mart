/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0066cc',
          dark: '#004d99',
        },
        secondary: {
          light: '#ffcc80',
          DEFAULT: '#ff9800',
          dark: '#cc7a00',
        },
      },
    },
  },
  plugins: [],
}