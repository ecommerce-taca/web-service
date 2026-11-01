/** @type {import('tailwindcss').Config} */
import sharedConfig from '../../shared/ui-components/tailwind-preset.js';

export default {
  presets: [sharedConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../shared/ui-components/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taca: {
          primary: {
            DEFAULT: '#0A68FF',
            hover: '#0855D2',
            light: '#EAF3FF',
          },
          sale: '#FF424E',
          warning: '#FF9800',
          success: '#00AB56',
          surface: '#F5F5FA',
          text: {
            main: '#242424',
            muted: '#787878',
          },
          border: '#EBEBF0',
        },
      },
    },
  },
  plugins: [],
}
