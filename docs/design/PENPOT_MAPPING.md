# Penpot to React Implementation Mapping

This document maps Penpot visual concepts to the React codebase architecture to prevent duplication and ensure consistency.

## 1. Token Mapping (Tailwind Configuration)
Instead of hardcoding colors, the `tailwind.config.js` in the `shared/` workspace should be configured with the Penpot Tokens:
```js
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
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
      }
    }
  }
}
```

## 2. Shared Component Mapping
Penpot UI elements mapped to `shared/ui-components/`:
- **Penpot "Overlay / ..."** -> `shared/ui-components/Modal.jsx` (A generic wrapper handling backdrop and z-index).
- **Text / Buttons and controls** -> `shared/ui-components/Button.jsx` (Using `taca-primary`, `rounded-none`, and Typography `Label 12`).

## 3. Workflow for New UI
Before implementing a Penpot frame:
1. Identify the App (`buyer`, `seller`, `admin`).
2. Identify the Feature (`features/products`, `features/auth`).
3. Check `shared/ui-components` for existing atoms (Buttons, Inputs).
4. If an overlay is required, use the shared `Modal` component and render the feature-specific form inside it.
5. Apply Tailwind classes corresponding to the exact Tokens defined above. DO NOT use arbitrary values like `w-[15px]` if a standard token or scale exists.
