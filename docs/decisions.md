# Architecture & Design Decisions

## 1. Product Detail Page Architecture (Buyer App)
**Date:** 2026-09-04
**Context:** The Product Detail Page (`ProductDetailPage.jsx`) was initially a monolithic component containing all logic and UI for the product gallery, purchase actions, shop info, tabs, and reviews.
**Decision:** We adopted a Feature-Based Architecture for the `products` domain.
**Implementation:**
- Split the monolithic page into modular components within `apps/buyer/src/features/products/components/`:
  - `ProductPurchase.jsx` (Gallery, pricing, variants, CTA)
  - `ProductShopCard.jsx` (Seller info)
  - `ProductContentTabs.jsx` (Description, Specs)
  - `ProductReviews.jsx` (Ratings, Review list)
- This ensures separation of concerns, easier maintenance, and better scalability when real API data is integrated.

## 2. Tailwind CSS Design Tokens
**Date:** 2026-09-04
**Context:** When translating Penpot designs, standard Tailwind utility colors (e.g., `text-primary`, `bg-surface`) conflicted with the project's custom color configuration.
**Decision:** All custom design tokens in this project are strictly namespaced under the `taca-` prefix to prevent conflicts and ensure high design fidelity.
**Implementation:**
- Used classes like `text-taca-primary`, `bg-taca-surface`, `border-taca-border`, `text-taca-sale`, etc.
- To handle specific UI elements (like CTA buttons and Variant Chips) that require a border radius (e.g., 8px) while the global preset forces `0px`, we explicitly use arbitrary values (`rounded-[8px]`, `rounded-[6px]`) to bypass the global constraint and match Penpot perfectly.
