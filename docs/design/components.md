# Components Inventory

The Penpot project does not rely on Penpot's native Library Components feature (no Main Components were found). However, repeating UI patterns and Overlays dictate the component architecture.

## 1. Global / Shared Components (`shared/` workspace)
- **Modal / Overlay Wrapper:** Crucial component, as the design uses over 15 distinct overlays across apps.
- **Button:** Needs variants for Primary, Secondary (Border), Destructive, and Ghost.
- **Input / Form Controls:** Standardized inputs with sharp corners (`rounded-none`).
- **Sidebar:** Used by both Seller and Admin (288px width, dark theme variants).
- **Data Table:** Shared table layout for Seller/Admin data grids.

## 2. Buyer App Components (`apps/buyer/src/components/`)
- **Mega Menu:** Complex dropdown navigation for categories.
- **Product Card:** Displays product image, price, title, and rating.
- **Cart Item Row:** Layout for products inside the cart.
- **Voucher Tag:** Visual representation of applied discounts.
- **VNPAY QR Display:** Specialized component for checkout.

## 3. Seller App Components (`apps/seller/src/components/`)
- **SPU/SKU Editor Form:** Complex dynamic form for product variants.
- **Packing Slip Generator:** Printable view for fulfillment.
- **Financial Chart/Widget:** Dashboard widgets for sales metrics.

## 4. Admin App Components (`apps/admin/src/components/`)
- **KYC Review Panel:** Document inspection component.
- **Dispute Resolution Thread:** Chat/Messaging style component for order disputes.
