# Design Tokens

Extracted directly from the Penpot "Taca Code Foundations" page.

## 1. Colors

| Token Name | Hex Value | Usage context | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Primary** | `#4f46e5` | Main CTAs, active states | `bg-indigo-600` |
| **Primary hover** | `#4338ca` | CTA hover states | `hover:bg-indigo-700` |
| **Sale / error** | `#e11d48` | Destructive actions, discounts | `bg-rose-600` |
| **Warning** | `#d97706` | Alerts, pending statuses | `bg-amber-600` |
| **Success** | `#059669` | Success messages, completed | `bg-emerald-600` |
| **Surface** | `#f8fafc` | Backgrounds, secondary containers| `bg-slate-50` |
| **Text main** | `#0f172a` | Primary typography | `text-slate-900` |
| **Text muted** | `#475569` | Secondary typography, captions | `text-slate-600` |
| **Border** | `#e2e8f0` | Dividers, input borders | `border-slate-200` |
| **Admin dark** | `#0f172a` | Admin sidebar background | `bg-slate-900` |

## 2. Typography

**Font Family:** Plus Jakarta Sans

| Token | Size | Weight | Line Height | Usage | Tailwind Classes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 32** | 32px | 800 (ExtraBold)| 1.35 | Marketplace title | `text-[32px] font-extrabold leading-[1.35]` |
| **Heading 24** | 24px | 700 (Bold) | 1.35 | Section heading | `text-[24px] font-bold leading-[1.35]` |
| **Heading 18** | 18px | 700 (Bold) | 1.35 | Card title | `text-[18px] font-bold leading-[1.35]` |
| **Body 14** | 14px | 400 (Regular) | 1.35 | Primary readable content| `text-[14px] font-normal leading-[1.35]` |
| **Label 12** | 12px | 700 (Bold) | 1.35 | Buttons and controls | `text-[12px] font-bold leading-[1.35]` |
| **Caption 10** | 10px | 500 (Medium) | 1.35 | Metadata and helper text| `text-[10px] font-medium leading-[1.35]` |

*(Note: Ensure correct mapping in `tailwind.config.js` to avoid arbitrary values `[]` where possible)*

## 3. Geometry & Spacing
- **Border Radius:** `0px` globally (sharp corners for all elements).
- **Sidebar Width (Admin/Seller):** `288px` (translates to `w-72` in Tailwind).
