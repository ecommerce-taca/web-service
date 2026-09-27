export const SELLER_MOCK_DATA = {
  shop: {
    id: 'shop_apple_001',
    name: 'Taca Apple Flagship Store',
    short_name: 'Taca Apple',
    email: 'support@taca-apple.vn',
    phone: '1900 6688',
    description: 'Đại lý ủy quyền Apple, sản phẩm chính hãng VN/A với chính sách bảo hành 1 đổi 1 trong 30 ngày.',
    status: 'ACTIVE',
    rating: 4.9,
    followers: 12480,
    warehouse: {
      name: 'Kho Tổng TP.HCM',
      contact: 'Nguyễn Văn Quản',
      phone: '0901234567',
      address: '28 Đường Nguyễn Huệ, Phường Bến Nghé, Thành phố Hồ Chí Minh'
    }
  },

  dashboard: {
    metrics: [
      { id: 'rev', label: 'Doanh thu hôm nay', value: '128.450.000 ₫', trend: '+18,4% so với hôm qua', isPositive: true },
      { id: 'ord', label: 'Đơn hàng', value: '428', trend: '+52 đơn mới', isPositive: true },
      { id: 'cvr', label: 'Tỷ lệ chuyển đổi', value: '6,8%', trend: '+0,9 điểm', isPositive: true },
      { id: 'spu', label: 'SPU đang bán', value: '1.248', trend: '32 SKU sắp hết hàng', isWarning: true }
    ],
    actionQueue: [
      { id: 'pending', label: 'Đơn chờ xác nhận', count: 38, urgent: true, path: '/orders?tab=pending' },
      { id: 'prep', label: 'Chuẩn bị hàng', count: 64, urgent: false, path: '/orders?tab=preparing' },
      { id: 'returns', label: 'Yêu cầu trả hàng', count: 12, urgent: true, path: '/orders?tab=returns' },
      { id: 'messages', label: 'Tin nhắn chưa đọc', count: 28, urgent: false, path: '/chat' },
      { id: 'low_stock', label: 'SKU tồn kho thấp', count: 32, urgent: true, path: '/products?tab=low_stock' }
    ],
    revenue7Days: {
      total: '624.800.000 ₫',
      growth: '+12,6%',
      chart: [
        { day: 'T2', val: 78, amount: '78.5M' },
        { day: 'T3', val: 86, amount: '86.2M' },
        { day: 'T4', val: 92, amount: '92.0M' },
        { day: 'T5', val: 84, amount: '84.8M' },
        { day: 'T6', val: 105, amount: '105.4M' },
        { day: 'T7', val: 128, amount: '128.5M' },
        { day: 'CN', val: 114, amount: '114.2M' }
      ]
    },
    recentOrders: [
      { id: '#TACA2408271', customer: 'Nguyễn Minh Anh', product: 'iPhone 16 Pro Max (256GB / Titan Tự Nhiên)', amount: '29.490.000 ₫', status: 'Chờ xác nhận', statusType: 'pending', time: '10 phút trước' },
      { id: '#TACA2408270', customer: 'Lê Phương Thảo', product: 'Sony WH-1000XM5 (Đen)', amount: '7.490.000 ₫', status: 'Chuẩn bị hàng', statusType: 'preparing', time: '25 phút trước' },
      { id: '#TACA2408269', customer: 'Hoàng Tuấn Khang', product: 'MacBook Air M3 (16GB / 512GB)', amount: '32.490.000 ₫', status: 'Chuẩn bị hàng', statusType: 'preparing', time: '40 phút trước' },
      { id: '#TACA2408268', customer: 'Trần Hồng Nhung', product: 'MacBook Air M3 2024 (8GB / 256GB)', amount: '27.990.000 ₫', status: 'Đang giao', statusType: 'shipping', time: '2 giờ trước' }
    ]
  },

  products: {
    metrics: [
      { id: 'spu_total', label: 'Tổng SPU', value: '1.248', trend: '+24 tháng này', isPositive: true },
      { id: 'sku_total', label: 'Tổng SKU', value: '4.826', trend: 'Bình quân 3,9 SKU/SPU', isPositive: true },
      { id: 'active', label: 'Đang bán', value: '1.186', trend: '95% danh mục', isPositive: true },
      { id: 'warning', label: 'Cảnh báo tồn kho', value: '32', trend: 'Cần nhập hàng', isWarning: true }
    ],
    items: [
      {
        id: 'SPU-IP16PM',
        name: 'iPhone 16 Pro Max',
        code: 'SPU-IP16PM',
        variants_desc: '6 SKU · 3 dung lượng × 2 màu',
        price_range: '29.490.000 ₫ – 43.990.000 ₫',
        stock: 218,
        sold: '5.2k',
        status: 'Đang bán',
        status_type: 'active',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&auto=format&fit=crop&q=80',
        skus: [
          { sku: 'IP16-256-NAT-WF', name: '256GB / Titan tự nhiên', price: 29490000, stock: 38, enabled: true },
          { sku: 'IP16-512-NAT-WF', name: '512GB / Titan tự nhiên', price: 34990000, stock: 24, enabled: true },
          { sku: 'IP16-1TB-NAT-WF', name: '1TB / Titan tự nhiên', price: 41990000, stock: 12, enabled: true },
          { sku: 'IP16-256-BLK-WF', name: '256GB / Titan đen', price: 29490000, stock: 54, enabled: true }
        ]
      },
      {
        id: 'SPU-MBA-M3',
        name: 'MacBook Air M3 2024',
        code: 'SPU-MBA-M3',
        variants_desc: '4 SKU · RAM / SSD',
        price_range: '27.990.000 ₫ – 39.490.000 ₫',
        stock: 64,
        sold: '1.8k',
        status: 'Đang bán',
        status_type: 'active',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&auto=format&fit=crop&q=80',
        skus: [
          { sku: 'MBA-M3-8-256', name: '8GB / 256GB / Midnight', price: 27990000, stock: 28, enabled: true },
          { sku: 'MBA-M3-16-512', name: '16GB / 512GB / Space Gray', price: 32490000, stock: 20, enabled: true }
        ]
      },
      {
        id: 'SPU-SONY-XM5',
        name: 'Sony WH-1000XM5',
        code: 'SPU-SONY-XM5',
        variants_desc: '2 SKU · Đen / Bạc',
        price_range: '7.490.000 ₫',
        stock: 0,
        sold: '936',
        status: 'Hết hàng',
        status_type: 'out_of_stock',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
        skus: [
          { sku: 'SONY-XM5-BLK', name: 'Đen Carbon', price: 7490000, stock: 0, enabled: false }
        ]
      },
      {
        id: 'SPU-IPAD-AIR-M2',
        name: 'iPad Air M2',
        code: 'SPU-IPAD-AIR-M2',
        variants_desc: '8 SKU · WiFi / Cellular',
        price_range: '15.290.000 ₫ – 28.990.000 ₫',
        stock: 42,
        sold: '624',
        status: 'Đang bán',
        status_type: 'active',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&auto=format&fit=crop&q=80',
        skus: [
          { sku: 'IPAD-M2-128-WF', name: '128GB / Wi-Fi / Blue', price: 15290000, stock: 18, enabled: true }
        ]
      }
    ]
  },

  orders: {
    metrics: [
      { id: 'pending', label: 'Chờ xác nhận', value: '38', trend: 'Xác nhận trước 14:00', isWarning: true },
      { id: 'prep', label: 'Chuẩn bị hàng', value: '64', trend: 'SLA còn 8 giờ', isPositive: true },
      { id: 'pickup', label: 'Chờ lấy hàng', value: '21', trend: '3 đơn trễ lịch', isWarning: true },
      { id: 'shipping', label: 'Đang giao', value: '286', trend: '96% đúng hẹn', isPositive: true }
    ],
    items: [
      {
        id: '#TACA2408271',
        customer: 'Nguyễn Minh Anh',
        phone: '0909123456',
        address: '123 Nguyễn Huệ, Phường Bến Nghé, TP.HCM',
        product: 'iPhone 16 Pro Max',
        sku: 'SKU IP16PM-256-NAT',
        quantity: 1,
        cod_amount: '29.490.000 ₫',
        carrier: 'GHN Express',
        sla: '01:42:18',
        status: 'Chờ xác nhận',
        status_type: 'pending'
      },
      {
        id: '#TACA2408270',
        customer: 'Lê Phương Thảo',
        phone: '0912345678',
        address: '45 Lê Duẩn, Phường Bến Nghé, TP.HCM',
        product: 'Sony WH-1000XM5',
        sku: 'SKU SONY-XM5-BLK',
        quantity: 1,
        cod_amount: '7.490.000 ₫',
        carrier: 'J&T Express',
        sla: '03:18:44',
        status: 'Chuẩn bị hàng',
        status_type: 'preparing'
      },
      {
        id: '#TACA2408269',
        customer: 'Hoàng Tuấn Khang',
        phone: '0938889999',
        address: '88 Hai Bà Trưng, Phường Bến Nghé, TP.HCM',
        product: 'MacBook Air M3',
        sku: 'SKU MBA-M3-16-512',
        quantity: 1,
        cod_amount: '32.490.000 ₫',
        carrier: 'SPX Express',
        sla: '05:24:16',
        status: 'Chuẩn bị hàng',
        status_type: 'preparing'
      },
      {
        id: '#TACA2408268',
        customer: 'Trần Hồng Nhung',
        phone: '0988776655',
        address: '12 Tôn Đức Thắng, Phường Bến Nghé, TP.HCM',
        product: 'MacBook Air M3 2024',
        sku: 'SKU MBA-M3-8-256',
        quantity: 1,
        cod_amount: '27.990.000 ₫',
        carrier: 'GHTK Express',
        sla: 'Đang giao',
        status: 'Đang giao',
        status_type: 'shipping'
      }
    ]
  },

  vouchers: {
    metrics: [
      { id: 'active', label: 'Đang chạy', value: '18', trend: '+3 chiến dịch', isPositive: true },
      { id: 'upcoming', label: 'Sắp diễn ra', value: '7', trend: 'Trong 7 ngày tới', isPositive: true },
      { id: 'used', label: 'Lượt sử dụng', value: '12.840', trend: '+24% tháng này', isPositive: true },
      { id: 'revenue', label: 'Doanh thu qua voucher', value: '1,28 tỷ ₫', trend: 'ROI 8,4×', isPositive: true }
    ],
    items: [
      {
        code: 'APPLE300K',
        name: 'Khách mới tháng 8',
        type: 'Giảm theo đơn',
        discount: '300.000 ₫',
        condition: 'Đơn từ 10 triệu',
        used: 842,
        total: 1000,
        time_range: '20/08 – 31/08',
        status: 'Đang chạy',
        status_type: 'active'
      },
      {
        code: 'FREESHIP0D',
        name: 'Freeship toàn shop',
        type: 'Miễn phí vận chuyển',
        discount: 'Tối đa 50.000 ₫',
        condition: 'Đơn từ 500.000 ₫',
        used: 6280,
        total: 10000,
        time_range: '01/08 – 31/08',
        status: 'Đang chạy',
        status_type: 'active'
      },
      {
        code: 'BACK2SCHOOL',
        name: 'Tựu trường laptop',
        type: 'Giảm theo đơn',
        discount: '8% · tối đa 1M',
        condition: 'SPU laptop chọn lọc',
        used: 0,
        total: 2000,
        time_range: '01/09 – 15/09',
        status: 'Sắp diễn ra',
        status_type: 'upcoming'
      }
    ]
  },

  finance: {
    balance: '42.800.000 ₫',
    pending: '6.420.000 ₫',
    bankAccount: 'Vietcombank •••• 4838',
    cycle: 'T+2 ngày làm việc',
    monthlyRevenue: '2,84 tỷ ₫',
    monthlyGrowth: '+16,8%',
    platformFee: '142.000.000 ₫',
    platformFeeRate: '5,0% doanh thu',
    settlement: {
      gross: '2.982.000.000 ₫',
      fee: '−142.000.000 ₫',
      refunds: '−38.200.000 ₫',
      shippingSubsidy: '+24.600.000 ₫',
      net: '2.826.400.000 ₫'
    },
    withdrawals: [
      {
        id: 'WD-240824-0281',
        created_at: '24/08/2026 · 09:42',
        account: 'Vietcombank ••••4838',
        amount: '20.000.000 ₫',
        fee: '0 ₫',
        status: 'Đã hoàn tất',
        status_type: 'completed'
      },
      {
        id: 'WD-240815-0193',
        created_at: '15/08/2026 · 14:15',
        account: 'Vietcombank ••••4838',
        amount: '15.000.000 ₫',
        fee: '0 ₫',
        status: 'Đã hoàn tất',
        status_type: 'completed'
      }
    ]
  }
};
