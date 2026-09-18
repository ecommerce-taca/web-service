# Danh sách màn hình UI đã code

Các màn hình sau trong Penpot đã được ánh xạ thành công sang component React:

1. **Trang Chủ**: `HomePage.jsx` (Hero Banner, Flash Sale, Official Shops, Categories, Mega Menu).
2. **Chi tiết SP**: `ProductDetailPage.jsx`, `ProductPurchase.jsx`, `ProductReviews.jsx`.
3. **Danh mục SP**: `CategoryLandingPage.jsx`, `SearchPage.jsx` (kèm sidebar lọc).
4. **Giỏ hàng & Thanh toán**: `CartPage.jsx`, `CheckoutPage.jsx`.
5. **Cửa hàng (Shop)**: `ShopPage.jsx`.
6. **Xác thực**: `AuthModal.jsx` (Login/Sign up popups), `ResetPasswordPage.jsx`, `VerifyEmailPage.jsx`.
7. **Tài khoản**: `AccountLayout`, `ProfilePage.jsx`, `OrdersPage.jsx`, `ReviewsPage.jsx`, `VouchersPage.jsx`, `WishlistPage.jsx`.

## Responsive Design
- 100% các trang đã hỗ trợ giao diện trên Desktop (lg, xl) và Mobile (md, sm).
- Ẩn Sidebar trên Mobile (đưa vào Drawer hoặc Modal).
- Chỉnh Breakpoint theo Tailwind (dựa trên class `sm:`, `md:`, `lg:`).
