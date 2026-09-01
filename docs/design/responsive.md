# Responsive Guidelines

Analysis of the "05 · Taca Responsive · Mobile + Tablet" page reveals the following responsive behaviors.

## Breakpoints (Assumed for Tailwind)
- `sm`: 640px (Mobile Landscape)
- `md`: 768px (Tablet)
- `lg`: 1024px (Small Desktop)
- `xl`: 1280px (Standard Desktop)
- `2xl`: 1440px (Wide Desktop - Base Penpot Design)

## Mobile Behaviors (Elements that change)
1. **Navigation:**
   - Desktop Mega Menu collapses into a Hamburger Menu / Drawer on mobile.
   - Seller/Admin Sidebar (288px) becomes a collapsible off-canvas drawer or bottom navigation depending on the app.
2. **Layout Stacking:**
   - Multi-column grids (e.g. 4-column product lists on Buyer app) stack into 2-column or 1-column layouts on Mobile.
   - Forms (like Checkout or SPU/SKU editor) convert from multi-column rows to single-column vertical stacks.
3. **Elements that Disappear:**
   - Complex data tables on Seller/Admin apps often hide secondary columns (e.g., hiding "Date created" or "Secondary status") on mobile, keeping only the primary identifier and action buttons.
4. **Overlays:**
   - Desktop Modals (e.g., `Overlay / Sign in` 500x520) convert into Full-screen Modals or Bottom Sheets on mobile to maximize tap targets and readability.

## Tablet Behaviors (Elements that resize)
- Data tables remain visible but may require horizontal scrolling if columns exceed the viewport.
- 1440px wide Buyer containers shrink, adjusting margins, but mostly retaining the grid structure (e.g., 3-column product list instead of 4).

## Constraints
- **NEVER assume responsive behavior if it is not supported by the design.**
- Ensure touch targets on mobile (buttons, links) are at least 44x44px.
- Fonts do not significantly scale down; they rely on text-wrapping, but `Display 32` may scale down to `24px` on mobile screens if it overflows.
