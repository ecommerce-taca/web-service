/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('../../shared/ui-components/tailwind-preset.js')],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
