/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('../../shared/ui-components/tailwind-preset.js')],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A68FF',
          hover: '#0855D2',
        },
        sale: '#FF424E',
        warning: '#FF9800',
        success: '#00AB56',
        surface: '#F5F5FA',
        main: '#242424',
        muted: '#787878',
        border: '#EBEBF0',
        admin: '#0F172A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
