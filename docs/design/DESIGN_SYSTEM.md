# Taca Ecommerce - Design System Overview

This document summarizes the core design principles and systemic patterns found in the Penpot UI designs for the Taca Ecommerce platform.

## 1. Design Language
- **Typography:** The system exclusively uses **Plus Jakarta Sans**, conveying a modern, clean, and legible interface.
- **Color Palette:** High-contrast, accessibility-focused palette. It relies on a strong Indigo primary (`#4f46e5`) with semantic colors for success, warning, and error states. Dark modes are utilized for specific segments like the Admin dashboard (`#0f172a`).
- **Shapes & Borders:** Strict adherence to 0px border-radius (`border-radius: 0px !important`). All cards, inputs, and buttons are perfectly rectangular, emphasizing a sharp, structural, and "code-matched" aesthetic.

## 2. Structural Composition
The UI is heavily compartmentalized, which perfectly aligns with the Micro-Frontend architecture. It relies on a global navigation structure (Shell) with independent sub-applications (Buyer, Seller, Admin) that have their own specialized layouts (e.g., Seller/Admin sidebar layouts, Buyer mega menus).

## 3. Micro-Frontend Alignment
- **Buyer App:** Focuses on conversion and product discovery. Uses wide 1440px container widths and grid layouts for product catalogs. Heavily relies on overlays for flows (Sign in, VNPAY QR).
- **Seller App:** Focuses on operational efficiency. Uses dense data tables, sidebar navigation, and specialized overlays for bulk actions.
- **Admin App:** Focuses on system oversight. Dark-mode oriented sidebars, with complex data management overlays (Dispute Resolution, KYC review).

## 4. UI Patterns
- **Overlays (Modals/Drawers):** Overlays are used extensively across all three applications (e.g., `Overlay / Sign in`, `Overlay / VNPAY QR`, `Overlay / KYC review`). This indicates a strong need for a centralized Modal/Overlay context or state management system in the React application.
- **Data Tables:** Used heavily in Seller and Admin apps.
- **Cards:** Used predominantly in the Buyer app for product listings and category blocks.
