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
    extend: {},
  },
  plugins: [],
}
