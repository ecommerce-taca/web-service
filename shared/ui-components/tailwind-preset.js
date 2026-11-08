/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        taca: {
          brand: {
            cart: '#4038C8',
            blue: '#0068A0',
            green: '#10A048',
            orange: '#E85008',
            red: '#E01840'
          },
          primary: {
            DEFAULT: '#4f46e5',
            hover: '#4338ca',
            light: '#eef2ff'
          },
          buyer: {
            DEFAULT: '#0A68FF',
            hover: '#0855D2',
            light: '#EAF3FF'
          },
          seller: {
            DEFAULT: '#4F46E5',
            hover: '#4338CA',
            light: '#EEF2FF'
          },
          admin: {
            DEFAULT: '#0A68FF',
            hover: '#0855D2',
            surface: '#0F172A'
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
      fontSize: {
        caption: ['11px', { lineHeight: '16px' }],
        body: ['14px', { lineHeight: '20px' }],
        title: ['18px', { lineHeight: '24px' }],
        heading: ['24px', { lineHeight: '32px' }],
        display: ['32px', { lineHeight: '40px' }]
      },
      spacing: {
        'brand-1': '4px',
        'brand-2': '8px',
        'brand-3': '12px',
        'brand-4': '16px',
        'brand-6': '24px',
        'brand-8': '32px',
        'brand-12': '48px',
        'brand-16': '64px'
      },
      borderRadius: {
        control: '8px',
        card: '12px',
        panel: '16px',
        pill: '9999px'
      },
      boxShadow: {
        brand: '0 1px 2px rgba(15, 23, 42, 0.06)',
        'brand-md': '0 4px 12px rgba(15, 23, 42, 0.08)',
        'brand-lg': '0 12px 32px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: [],
}
