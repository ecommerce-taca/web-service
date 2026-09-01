/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        taca: {
          primary: {
            DEFAULT: '#4f46e5',
            hover: '#4338ca'
          },
          sale: '#e11d48',
          warning: '#d97706',
          success: '#059669',
          surface: '#f8fafc',
          text: {
            main: '#0f172a',
            muted: '#475569'
          },
          border: '#e2e8f0',
          adminDark: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '9999px',
      }
    }
  },
  plugins: [],
}
