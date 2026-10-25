// Nội dung tĩnh của Landing Page (khớp bản thiết kế đã duyệt).
// LƯU Ý: Các số liệu thống kê, biểu phí và thông tin pháp lý dưới đây là SỐ LIỆU MẪU,
// bắt buộc thay bằng số liệu thật trước khi phát hành.

export const SECTION_IDS = {
  top: 'top',
  shop: 'mua-sam',
  sell: 'ban-hang',
  fees: 'fees',
  faq: 'faq',
  iosNotify: 'ios-notify',
};

export const HERO_FEATURES = [
  {
    id: 'genuine',
    title: 'Hàng chính hãng',
    description: 'Mọi shop được kiểm duyệt trước khi bán. Sản phẩm rõ nguồn gốc, kèm đánh giá từ người mua thật.',
    tone: 'emerald',
  },
  {
    id: 'modern',
    title: 'Hiện đại',
    description: 'Tìm nhanh, so sánh giá, thanh toán trực tuyến và theo dõi đơn hàng ngay trên điện thoại.',
    tone: 'indigo',
  },
  {
    id: 'nationwide',
    title: 'Giao toàn quốc',
    description: 'Giao đến mọi tỉnh thành. Xem hành trình đơn hàng theo thời gian thực, từ shop đến tận tay bạn.',
    tone: 'blue',
  },
  {
    id: 'refund',
    title: 'Hoàn tiền nếu hàng giả',
    description: 'Cam kết của Taca với người mua. Đội ngũ hỗ trợ đồng hành từ lúc đặt hàng đến khi nhận hàng.',
    tone: 'orange',
  },
];

export const TRUST_ITEMS = [
  { id: 'payment', title: 'Thanh toán trực tuyến', subtitle: 'hoặc COD khi nhận hàng' },
  { id: 'verified', title: 'Kiểm duyệt người bán', subtitle: 'Mọi shop đều được xác minh' },
  { id: 'tracking', title: 'Theo dõi đơn hàng', subtitle: 'Cập nhật từng bước giao' },
  { id: 'reviews', title: 'Đánh giá thật', subtitle: 'Chỉ từ người đã mua' },
];

// Hình minh họa danh mục vẽ bằng SVG (không dùng ảnh có bản quyền)
export const FEATURED_CATEGORIES = [
  {
    label: 'Điện thoại & Máy tính bảng',
    slug: 'dien-thoai',
    background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
    backColor: '#a5b4fc',
    frontColor: '#4f46e5',
    back: 'M30 12h40a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z',
    front: 'M68 24h22a5 5 0 0 1 5 5v42a5 5 0 0 1-5 5H68a5 5 0 0 1-5-5V29a5 5 0 0 1 5-5z',
    line: 'M74 68h10M40 60h14M36 22h28',
  },
  {
    label: 'Laptop & Máy tính',
    slug: 'laptop',
    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    backColor: '#93c5fd',
    frontColor: '#0a68ff',
    back: 'M30 14h60a4 4 0 0 1 4 4v40H26V18a4 4 0 0 1 4-4z',
    front: 'M14 58h92l-7 10H21z',
    line: 'M36 26h30M36 35h44M36 44h22',
  },
  {
    label: 'Nhà cửa & Đời sống',
    slug: 'gia-dung',
    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    backColor: '#6ee7b7',
    frontColor: '#059669',
    back: 'M32 40l28-22 28 22v32H32z',
    front: 'M20 44l40-32 40 32-6 6-34-27-34 27z',
    line: 'M54 72V56h12v16M39 50h8v8h-8zM73 50h8v8h-8z',
  },
  {
    label: 'Sách',
    slug: 'nha-sach',
    background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    backColor: '#fdba74',
    frontColor: '#ea580c',
    back: 'M24 18h20v54H24zM47 26h20v46H47z',
    front: 'M72 24l18-5 14 49-18 5z',
    line: 'M28 30h12M28 60h12M51 38h12M51 60h12M80 32l8-2',
  },
  {
    label: 'Thời trang',
    slug: 'thoi-trang',
    background: 'linear-gradient(135deg, #eef2ff, #fff7ed)',
    backColor: '#c4b5fd',
    frontColor: '#f97316',
    back: 'M40 16l-18 12 8 14 8-4v34h40V38l8 4 8-14-18-12c-2 6-8 10-18 10s-16-4-18-10z',
    front: 'M80 46h24l3 28H77z',
    line: 'M44 18c3 6 8 9 14 9s11-3 14-9M86 46v-4a6 6 0 0 1 12 0v4',
  },
  {
    label: 'Làm đẹp & Sức khỏe',
    slug: 'lam-dep',
    background: 'linear-gradient(135deg, #ecfdf5, #eff6ff)',
    backColor: '#5eead4',
    frontColor: '#1d4ed8',
    back: 'M42 12h16v14H42zM36 28h28v40a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z',
    front: 'M68 40h38v9H68zM70 51h34v19a4 4 0 0 1-4 4H74a4 4 0 0 1-4-4z',
    line: 'M50 42v16M42 50h16M78 61h18',
  },
];

export const BUYING_STEPS = [
  {
    id: 'find',
    title: 'Tìm sản phẩm',
    description: 'Tìm theo từ khóa, lọc theo danh mục và khoảng giá. Xem chi tiết và đánh giá trước khi chọn.',
  },
  {
    id: 'pay',
    title: 'Đặt hàng và thanh toán',
    description: 'Chọn địa chỉ, cách giao và áp voucher. Thanh toán trực tuyến hoặc tiền mặt khi nhận.',
  },
  {
    id: 'track',
    title: 'Theo dõi và đánh giá',
    description: 'Nhận email xác nhận kèm hóa đơn, theo dõi giao hàng, hủy trước khi gửi và đánh giá sau khi nhận.',
  },
];

// SỐ LIỆU MẪU: kết quả trung bình mỗi shop
export const AVERAGE_SHOP_RESULTS = {
  revenuePerMonth: 6.9, // triệu ₫
  ordersPerMonth: 28,
  averageOrderValue: 247000, // ₫
};

// SỐ LIỆU MẪU: doanh thu trung bình mỗi shop theo tháng (triệu ₫)
export const MONTHLY_AVERAGE_REVENUE = [
  { label: 'T5', value: 5.1 },
  { label: 'T6', value: 5.4 },
  { label: 'T7', value: 5.6 },
  { label: 'T8', value: 6.0 },
  { label: 'T9', value: 6.2 },
  { label: 'T10', value: 6.9 },
];

export const CHART_MAX_VALUE = 7.5;

// SỐ LIỆU MẪU: thống kê toàn sàn
export const PLATFORM_STATS = {
  shops: 12500,
  buyersMillions: 1.2,
  ordersPerMonth: 350000,
  minCommissionRate: 5,
};

export const OPEN_SHOP_STEPS = [
  { id: 'profile', title: 'Hồ sơ shop', description: 'Tên shop, thông tin kinh doanh, logo.' },
  { id: 'kyc', title: 'Xác minh KYC', description: 'Cần để đăng bán sản phẩm và rút tiền.' },
  { id: 'warehouse', title: 'Kho và vận chuyển', description: 'Địa chỉ lấy hàng, đơn vị vận chuyển.' },
  { id: 'bank', title: 'Tài khoản ngân hàng', description: 'Nơi nhận tiền khi bạn rút từ ví.' },
  { id: 'product', title: 'Sản phẩm đầu tiên', description: 'Đăng sản phẩm, giá, tồn kho.' },
];

// SỐ LIỆU MẪU: biểu phí theo ngành hàng (%), thuế khấu trừ cần kế toán xác nhận
export const FEE_CATEGORIES = [
  { id: 'tech', label: 'Điện thoại, Laptop & Điện tử', rate: 5 },
  { id: 'book', label: 'Sách & Văn phòng phẩm', rate: 6 },
  { id: 'home', label: 'Nhà cửa & Đời sống', rate: 7 },
  { id: 'fashion', label: 'Thời trang & Làm đẹp', rate: 8 },
];

export const WITHHOLDING_TAX_RATE = 1.5;
export const DEFAULT_CALCULATOR_PRICE = 500000;

export const FAQS = [
  {
    question: 'Tôi có cần đăng nhập để mua hàng không?',
    answer: 'Bạn xem và tìm sản phẩm không cần đăng nhập. Cần đăng nhập khi thêm vào giỏ và thanh toán.',
  },
  {
    question: 'Taca hỗ trợ những cách thanh toán nào?',
    answer: 'Thanh toán trực tuyến (ví điện tử, thẻ ngân hàng, QR) và thanh toán khi nhận hàng (COD).',
  },
  {
    question: 'Tôi có thể hủy đơn không?',
    answer: 'Có, trước khi shop gửi hàng. Theo dõi trạng thái trong mục Đơn hàng.',
  },
  {
    question: 'Mở shop cần giấy tờ gì?',
    answer: '[DANH SÁCH GIẤY TỜ KYC]. Bạn vào Seller Center ngay sau khi tạo shop; KYC cần để đăng bán và rút tiền.',
  },
  {
    question: 'Phí bán hàng trên Taca là bao nhiêu?',
    answer: 'Mở shop miễn phí. Phí hoa hồng từ 5% đến 8% tùy ngành hàng, chỉ tính trên đơn thành công, cộng thuế khấu trừ 1,5% theo quy định. Xem chi tiết tại mục Biểu phí bán hàng.',
  },
];

export const QUESTION_TOPICS = [
  { value: 'buy', label: 'Mua hàng & giao hàng' },
  { value: 'pay', label: 'Thanh toán & hoàn tiền' },
  { value: 'sell', label: 'Bán hàng trên Taca' },
  { value: 'account', label: 'Tài khoản' },
  { value: 'other', label: 'Khác' },
];

export const QUESTION_MAX_LENGTH = 500;
export const QUESTION_MIN_LENGTH = 10;

export const PAYMENT_PARTNERS = [
  { id: 'wallet', label: 'Ví điện tử', tone: 'indigo' },
  { id: 'bank', label: 'Ngân hàng', tone: 'blue' },
  { id: 'card', label: 'Thẻ quốc tế', tone: 'indigo' },
  { id: 'qr', label: 'QR', tone: 'emerald' },
  { id: 'cod', label: 'COD', tone: 'orange' },
];

export const SHIPPING_PARTNERS = [
  { id: 'standard', label: 'Tiêu chuẩn', tone: 'blue' },
  { id: 'express', label: 'Hỏa tốc', tone: 'orange' },
  { id: 'economy', label: 'Tiết kiệm', tone: 'emerald' },
];

// THÔNG TIN MẪU: thay bằng thông tin đăng ký thật của doanh nghiệp trước khi phát hành
export const LEGAL_INFO = {
  businessRegistrationNumber: '0318 765 432',
  issuedBy: 'Sở Tài chính TP. Hồ Chí Minh',
  issuedDate: '15/03/2026',
  ecommerceRegistrationCode: 'TMDT-2026-004218',
  contentOwner: 'Nguyễn Văn An',
  copyright: '© 2026 Công ty TNHH Taca Việt Nam · MST 0318765432 · 123 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh · Hotline 1900 1234',
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
