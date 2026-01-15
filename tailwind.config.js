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
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7', // Azul Habana Principal
          700: '#0369a1',
          800: '#075985', // Azul Oscuro (Textos / Navbar)
          900: '#0c4a6e',
        },
        secondary: {
          400: '#fbbf24',
          500: '#f59e0b', // Dorado Acento (Botones de acción)
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}