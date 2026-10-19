import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

/**
 * Cây danh mục chuẩn cho Buyer (hỗ trợ Mega Menu và Category Landing)
 */
export const CATEGORIES_TREE = [
  {
    id: 'dien-thoai',
    name: 'Điện thoại & Tablet',
    slug: 'dien-thoai-tablet',
    children: [
      { id: 'dien-thoai-apple', name: 'iPhone', slug: 'iphone' },
      { id: 'dien-thoai-samsung', name: 'Samsung Galaxy', slug: 'samsung' },
      { id: 'may-tinh-bang', name: 'Máy tính bảng', slug: 'may-tinh-bang' },
      { id: 'dong-ho-thong-minh', name: 'Đồng hồ thông minh', slug: 'dong-ho' },
      { id: 'phu-kien-dien-thoai', name: 'Phụ kiện điện thoại', slug: 'phu-kien-dt' }
    ]
  },
  {
    id: 'laptop',
    name: 'Laptop & Máy tính',
    slug: 'laptop-may-tinh',
    children: [
      { id: 'macbook', name: 'MacBook Apple', slug: 'macbook' },
      { id: 'laptop-van-phong', name: 'Laptop mỏng nhẹ', slug: 'laptop-van-phong' },
      { id: 'laptop-gaming', name: 'Laptop Gaming', slug: 'laptop-gaming' }
    ]
  },
  {
    id: 'am-thanh',
    name: 'Âm thanh & Phụ kiện',
    slug: 'am-thanh',
    children: [
      { id: 'tai-nghe-chong-on', name: 'Tai nghe chống ồn', slug: 'tai-nghe' },
      { id: 'loa-bluetooth', name: 'Loa di động Bluetooth', slug: 'loa-bluetooth' }
    ]
  },
  {
    id: 'gia-dung',
    name: 'Thiết bị thông minh',
    slug: 'thiet-bi-thong-minh',
    children: [
      { id: 'robot-hut-bui', name: 'Robot hút bụi lau nhà', slug: 'robot-hut-bui' },
      { id: 'may-doc-sach', name: 'Máy đọc sách Kindle', slug: 'may-doc-sach' }
    ]
  }
];

export const PRODUCTS_CATALOG = [
  {
    id: 1,
    title: 'Apple iPhone 16 Pro Max 256GB - Titan Tự Nhiên',
    name: 'Apple iPhone 16 Pro Max 256GB - Titan Tự Nhiên',
    slug: 'apple-iphone-16-pro-max-256gb',
    price: 29490000,
    originalPrice: 34990000,
    discount: 16,
    price_summary: {
      min_price: 29490000,
      max_price: 43990000,
      currency: 'VND'
    },
    rating: 4.9,
    reviewCount: 1284,
    soldCount: 1420,
    rating_summary: {
      average_rating: 4.9,
      review_count: 1284,
      sold_count: 1420
    },
    brand: 'Apple',
    category: 'dien-thoai',
    primary_category_id: 'dien-thoai',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship', 'Giao 2H'],
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop1',
      name: 'Taca Apple Flagship Store',
      avatar: 'TA',
      rating: 4.9,
      followers: '120k'
    },
    shop_projection: {
      shop_id: 'shop1',
      name: 'Taca Apple Flagship Store',
      slug: 'taca-apple',
      logo_url: 'TA',
      rating: 4.9,
      follower_count: 120000,
      is_official: true
    },
    attribute_definitions: [
      {
        name: 'Dung lượng',
        display_as: 'PLAIN',
        values: ['256GB', '512GB', '1TB']
      },
      {
        name: 'Màu sắc',
        display_as: 'COLOR_SWATCH',
        values: ['Titan tự nhiên', 'Titan đen', 'Titan sa mạc'],
        value_meta: {
          'Titan tự nhiên': { swatch_hex: '#9A948C' },
          'Titan đen': { swatch_hex: '#2B2B2B' },
          'Titan sa mạc': { swatch_hex: '#C8A27A' }
        }
      }
    ],
    skus: [
      {
        id: 'sku-101',
        sku_code: 'IP16PM-256-NAT',
        attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên' },
        price: { base_price: 34990000, sale_price: 29490000, currency: 'VND' },
        stock_display: 38,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-102',
        sku_code: 'IP16PM-256-BLK',
        attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan đen' },
        price: { base_price: 34990000, sale_price: 29490000, currency: 'VND' },
        stock_display: 25,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-103',
        sku_code: 'IP16PM-512-NAT',
        attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan tự nhiên' },
        price: { base_price: 39990000, sale_price: 35990000, currency: 'VND' },
        stock_display: 18,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-104',
        sku_code: 'IP16PM-1TB-DES',
        attributes: { 'Dung lượng': '1TB', 'Màu sắc': 'Titan sa mạc' },
        price: { base_price: 47990000, sale_price: 43990000, currency: 'VND' },
        stock_display: 9,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    variants: [
      { type: 'storage', options: ['256GB', '512GB', '1TB'] },
      { type: 'color', options: ['Titan tự nhiên', 'Titan đen', 'Titan sa mạc'] }
    ],
    stock_display: 90,
    version: 1,
    isFlashSale: true,
    description: 'Chip Apple A18 Pro tiến trình 3nm siêu mạnh. Màn hình Super Retina XDR 6.9 inch viền mỏng kỷ lục. Nút Điều khiển Camera (Camera Control) hoàn toàn mới cho trải nghiệm nhiếp ảnh chuyên nghiệp.'
  },
  {
    id: 2,
    title: 'Apple MacBook Air 13 M3 8-core CPU 10-core GPU 16GB 256GB',
    name: 'Apple MacBook Air 13 M3 8-core CPU 10-core GPU 16GB 256GB',
    slug: 'macbook-air-13-m3-16gb-256gb',
    price: 27990000,
    originalPrice: 31990000,
    discount: 12,
    price_summary: {
      min_price: 27990000,
      max_price: 39490000,
      currency: 'VND'
    },
    rating: 4.8,
    reviewCount: 420,
    soldCount: 650,
    rating_summary: {
      average_rating: 4.8,
      review_count: 420,
      sold_count: 650
    },
    brand: 'Apple',
    category: 'laptop',
    primary_category_id: 'laptop',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship'],
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop1',
      name: 'Taca Apple Flagship Store',
      avatar: 'TA',
      rating: 4.9,
      followers: '120k'
    },
    shop_projection: {
      shop_id: 'shop1',
      name: 'Taca Apple Flagship Store',
      slug: 'taca-apple',
      logo_url: 'TA',
      rating: 4.9,
      follower_count: 120000,
      is_official: true
    },
    attribute_definitions: [
      {
        name: 'RAM',
        display_as: 'PLAIN',
        values: ['16GB', '24GB']
      },
      {
        name: 'Màu sắc',
        display_as: 'COLOR_SWATCH',
        values: ['Midnight', 'Starlight', 'Silver'],
        value_meta: {
          'Midnight': { swatch_hex: '#1E2530' },
          'Starlight': { swatch_hex: '#F0EAD6' },
          'Silver': { swatch_hex: '#E3E4E5' }
        }
      }
    ],
    skus: [
      {
        id: 'sku-201',
        sku_code: 'MBA-M3-16-MID',
        attributes: { 'RAM': '16GB', 'Màu sắc': 'Midnight' },
        price: { base_price: 31990000, sale_price: 27990000, currency: 'VND' },
        stock_display: 32,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    variants: [
      { type: 'ram', options: ['16GB', '24GB'] },
      { type: 'color', options: ['Midnight', 'Starlight', 'Space Gray', 'Silver'] }
    ],
    stock_display: 64,
    version: 1,
    isFlashSale: false,
    description: 'Thiết kế nhôm nguyên khối siêu mỏng nhẹ chỉ 1.24kg. Chip M3 hiệu năng vượt trội, thời lượng pin lên đến 18 tiếng liên tục, hỗ trợ kết nối 2 màn hình ngoài.'
  },
  {
    id: 3,
    title: 'Tai nghe Chống Ồn Không Dây Cao Cấp Sony WH-1000XM5',
    name: 'Tai nghe Chống Ồn Không Dây Cao Cấp Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    price: 7490000,
    originalPrice: 8490000,
    discount: 11,
    price_summary: {
      min_price: 7490000,
      max_price: 7490000,
      currency: 'VND'
    },
    rating: 4.8,
    reviewCount: 890,
    soldCount: 920,
    rating_summary: {
      average_rating: 4.8,
      review_count: 890,
      sold_count: 920
    },
    brand: 'Sony',
    category: 'am-thanh',
    primary_category_id: 'am-thanh',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship', 'Giao 2H'],
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop2',
      name: 'Sony Official Store VN',
      avatar: 'SO',
      rating: 4.8,
      followers: '85k'
    },
    shop_projection: {
      shop_id: 'shop2',
      name: 'Sony Official Store VN',
      slug: 'sony-official',
      logo_url: 'SO',
      rating: 4.8,
      follower_count: 85000,
      is_official: true
    },
    attribute_definitions: [
      {
        name: 'Màu sắc',
        display_as: 'COLOR_SWATCH',
        values: ['Đen', 'Bạc'],
        value_meta: {
          'Đen': { swatch_hex: '#111111' },
          'Bạc': { swatch_hex: '#D1D5DB' }
        }
      }
    ],
    skus: [
      {
        id: 'sku-301',
        sku_code: 'SONY-XM5-BLK',
        attributes: { 'Màu sắc': 'Đen' },
        price: { base_price: 8490000, sale_price: 7490000, currency: 'VND' },
        stock_display: 0,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    variants: [
      { type: 'color', options: ['Đen', 'Bạc', 'Xanh Midnight'] }
    ],
    stock_display: 0,
    version: 1,
    isFlashSale: true,
    description: 'Công nghệ chống ồn đỉnh cao hàng đầu thế giới với bộ xử lý Integrated Processor V1 cùng 8 micro lọc âm. Chất âm Hi-Res Audio sắc nét sống động, thời lượng pin 30 giờ.'
  },
  {
    id: 4,
    title: 'Robot Hút Bụi Lau Nhà Thông Minh Xiaomi Robot Vacuum X20+',
    name: 'Robot Hút Bụi Lau Nhà Thông Minh Xiaomi Robot Vacuum X20+',
    slug: 'xiaomi-robot-vacuum-x20-plus',
    price: 8990000,
    originalPrice: 11990000,
    discount: 25,
    price_summary: {
      min_price: 8990000,
      max_price: 8990000,
      currency: 'VND'
    },
    rating: 4.7,
    reviewCount: 310,
    soldCount: 450,
    rating_summary: {
      average_rating: 4.7,
      review_count: 310,
      sold_count: 450
    },
    brand: 'Xiaomi',
    category: 'gia-dung',
    primary_category_id: 'gia-dung',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop3',
      name: 'Xiaomi Authorized Mall',
      avatar: 'XI',
      rating: 4.7,
      followers: '96k'
    },
    shop_projection: {
      shop_id: 'shop3',
      name: 'Xiaomi Authorized Mall',
      slug: 'xiaomi-mall',
      logo_url: 'XI',
      rating: 4.7,
      follower_count: 96000,
      is_official: true
    },
    stock_display: 45,
    version: 1,
    variants: [{ type: 'color', options: ['Trắng'] }],
    isFlashSale: false,
    description: 'Trạm sạc toàn năng all-in-one: tự động giặt giẻ xoay, tự động sấy khô khí nóng và tự động hút rác. Lực hút cực đại 6000Pa đánh bay mọi bụi bẩn.'
  },
  {
    id: 5,
    title: 'Máy Đọc Sách Amazon Kindle Paperwhite 5 (11th Gen) 16GB',
    name: 'Máy Đọc Sách Amazon Kindle Paperwhite 5 (11th Gen) 16GB',
    slug: 'amazon-kindle-paperwhite-5-16gb',
    price: 3890000,
    originalPrice: 4290000,
    discount: 9,
    price_summary: {
      min_price: 3890000,
      max_price: 3890000,
      currency: 'VND'
    },
    rating: 4.9,
    reviewCount: 520,
    soldCount: 880,
    rating_summary: {
      average_rating: 4.9,
      review_count: 520,
      sold_count: 880
    },
    brand: 'Amazon',
    category: 'phu-kien',
    primary_category_id: 'gia-dung',
    isOfficial: false,
    tags: ['Freeship'],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop4',
      name: 'E-Reader Corner',
      avatar: 'ER',
      rating: 4.8,
      followers: '23k'
    },
    shop_projection: {
      shop_id: 'shop4',
      name: 'E-Reader Corner',
      slug: 'ereader-corner',
      logo_url: 'ER',
      rating: 4.8,
      follower_count: 23000,
      is_official: false
    },
    stock_display: 22,
    version: 1,
    variants: [{ type: 'color', options: ['Đen', 'Xanh Agave'] }],
    isFlashSale: false,
    description: 'Màn hình E-ink 6.8 inch 300 ppi sắc nét như giấy in thật. Đèn nền có thể tùy chỉnh nhiệt độ màu vàng ấm, chống nước chuẩn IPX8 và pin lên đến 10 tuần.'
  },
  {
    id: 6,
    title: 'Điện thoại Samsung Galaxy S24 Ultra 5G 12GB 256GB - AI Phone',
    name: 'Điện thoại Samsung Galaxy S24 Ultra 5G 12GB 256GB - AI Phone',
    slug: 'samsung-galaxy-s24-ultra-5g-256gb',
    price: 24990000,
    originalPrice: 31990000,
    discount: 22,
    price_summary: {
      min_price: 24990000,
      max_price: 36990000,
      currency: 'VND'
    },
    rating: 4.8,
    reviewCount: 1140,
    soldCount: 1300,
    rating_summary: {
      average_rating: 4.8,
      review_count: 1140,
      sold_count: 1300
    },
    brand: 'Samsung',
    category: 'dien-thoai',
    primary_category_id: 'dien-thoai',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship', 'Giao 2H'],
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop5',
      name: 'Samsung Official Plaza',
      avatar: 'SS',
      rating: 4.9,
      followers: '150k'
    },
    shop_projection: {
      shop_id: 'shop5',
      name: 'Samsung Official Plaza',
      slug: 'samsung-plaza',
      logo_url: 'SS',
      rating: 4.9,
      follower_count: 150000,
      is_official: true
    },
    stock_display: 70,
    version: 1,
    variants: [
      { type: 'storage', options: ['256GB', '512GB', '1TB'] },
      { type: 'color', options: ['Xám Titan', 'Đen Titan'] }
    ],
    isFlashSale: true,
    description: 'Quyền năng Galaxy AI tiên phong: Khoanh tròn để tìm kiếm, Trợ lý phiên dịch trực tiếp và Trợ lý chỉnh ảnh chuyên nghiệp. Khung viền Titan bền bỉ cùng bút S-Pen tích hợp.'
  },
  {
    id: 7,
    title: 'Loa Bluetooth Di Động JBL Flip 6 Chống Nước IP67',
    name: 'Loa Bluetooth Di Động JBL Flip 6 Chống Nước IP67',
    slug: 'loa-bluetooth-jbl-flip-6',
    price: 2490000,
    originalPrice: 2990000,
    discount: 17,
    price_summary: {
      min_price: 2490000,
      max_price: 2490000,
      currency: 'VND'
    },
    rating: 4.7,
    reviewCount: 680,
    soldCount: 940,
    rating_summary: {
      average_rating: 4.7,
      review_count: 680,
      sold_count: 940
    },
    brand: 'JBL',
    category: 'am-thanh',
    primary_category_id: 'am-thanh',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship'],
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop6',
      name: 'JBL Sound Hub',
      avatar: 'JB',
      rating: 4.8,
      followers: '45k'
    },
    shop_projection: {
      shop_id: 'shop6',
      name: 'JBL Sound Hub',
      slug: 'jbl-sound',
      logo_url: 'JB',
      rating: 4.8,
      follower_count: 45000,
      is_official: true
    },
    stock_display: 55,
    version: 1,
    variants: [{ type: 'color', options: ['Đen', 'Đỏ', 'Xanh dương'] }],
    isFlashSale: false,
    description: 'Âm thanh JBL Original Pro Sound mạnh mẽ bùng nổ trong kích thước nhỏ gọn. Chuẩn kháng nước kháng bụi IP67 bền bỉ, chơi nhạc liên tục 12 tiếng.'
  },
  {
    id: 8,
    title: 'Bàn Phím Không Dây Cao Cấp Logitech MX Keys S',
    name: 'Bàn Phím Không Dây Cao Cấp Logitech MX Keys S',
    slug: 'ban-phim-logitech-mx-keys-s',
    price: 2190000,
    originalPrice: 2690000,
    discount: 18,
    price_summary: {
      min_price: 2190000,
      max_price: 2190000,
      currency: 'VND'
    },
    rating: 4.9,
    reviewCount: 460,
    soldCount: 710,
    rating_summary: {
      average_rating: 4.9,
      review_count: 460,
      sold_count: 710
    },
    brand: 'Logitech',
    category: 'phu-kien',
    primary_category_id: 'gia-dung',
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship'],
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'
    ],
    shop: {
      id: 'shop7',
      name: 'Logitech G Flagship',
      avatar: 'LG',
      rating: 4.9,
      followers: '78k'
    },
    shop_projection: {
      shop_id: 'shop7',
      name: 'Logitech G Flagship',
      slug: 'logitech-flagship',
      logo_url: 'LG',
      rating: 4.9,
      follower_count: 78000,
      is_official: true
    },
    stock_display: 40,
    version: 1,
    variants: [{ type: 'color', options: ['Graphite', 'Pale Gray'] }],
    isFlashSale: false,
    description: 'Phím lõm Perfect Stroke ôm trọn đầu ngón tay cho trải nghiệm gõ êm mượt tối ưu. Đèn nền thông minh tự động bật sáng khi tay tiếp cận, kết nối tối đa 3 thiết bị cùng lúc.'
  }
];

// Sort của SortBar → sort của Search Service (docs search §3.1: relevance|newest|price_asc|price_desc|rating_desc)
const SEARCH_SORT_MAP = {
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  newest: 'newest',
};

export const productApi = {
  /**
   * Tìm kiếm sản phẩm qua Search Service: GET /products/search
   * @param {Object} params - { q, category, brand, minPrice, maxPrice, sort, page, size }
   * @returns {Promise<{data: {items: Array, total: number}}>} cùng shape với getProducts ở mock mode
   */
  searchProducts: async (params = {}, options = {}) => {
    if (isMockMode()) {
      return productApi.getProducts(params, options);
    }
    const q = (params.q || '').trim();
    const query = {
      q: q || undefined,
      category_id: params.category && params.category !== 'all' ? params.category : undefined,
      brand: params.brand || undefined,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      // 'popular'/'sales' không có ở Search → relevance khi có từ khoá, newest khi chỉ duyệt
      sort: SEARCH_SORT_MAP[params.sort] || (q ? 'relevance' : 'newest'),
      page: params.page,
      size: params.size,
    };
    const res = await apiClient.get('/products/search', { params: query, signal: options.signal });
    const items = (Array.isArray(res?.data) ? res.data : []).map((p) => ({
      id: p.product_id,
      name: p.title,
      slug: p.slug,
      price: p.price?.amount ?? 0,
      image: p.cover_url || '',
      rating: p.rating_avg ?? 0,
      shop: p.shop,
    }));
    return { data: { items, total: res?.meta?.total ?? items.length }, meta: res?.meta };
  },

  /**
   * Lấy danh sách sản phẩm có bộ lọc, sắp xếp, phân trang và batch hydration
   * @param {Object} params - { q, category_id, category, shop_id, min_price, max_price, rating, sort, page, size, product_ids }
   */
  getProducts: async (params = {}, options = {}) => {
    const signal = options.signal || params.signal;

    // 1. Chế độ LIVE Backend (dành cho Tester)
    if (!isMockMode()) {
      const normalizedParams = { ...params };
      delete normalizedParams.signal;

      if (Array.isArray(params.product_ids)) {
        normalizedParams.product_ids = params.product_ids.join(',');
      } else if (Array.isArray(params.productIds)) {
        normalizedParams.product_ids = params.productIds.join(',');
        delete normalizedParams.productIds;
      }
      if (params.categoryId && !normalizedParams.category_id) {
        normalizedParams.category_id = params.categoryId;
        delete normalizedParams.categoryId;
      }
      if (params.category && !normalizedParams.category_id && params.category !== 'all') {
        normalizedParams.category_id = params.category;
      }
      if (params.minPrice !== undefined && normalizedParams.min_price === undefined) {
        normalizedParams.min_price = params.minPrice;
        delete normalizedParams.minPrice;
      }
      if (params.maxPrice !== undefined && normalizedParams.max_price === undefined) {
        normalizedParams.max_price = params.maxPrice;
        delete normalizedParams.maxPrice;
      }
      return apiClient.get('/products', { params: normalizedParams, signal });
    }

    // 2. Chế độ Mock Catalog (giả lập delay nhẹ 150ms để kiểm tra loading state)
    await new Promise((res, rej) => {
      const timer = setTimeout(res, 150);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          rej(new DOMException('Aborted', 'AbortError'));
        });
      }
    });

    let result = [...PRODUCTS_CATALOG];

    // Batch hydration theo product_ids (nếu có: chuỗi phẩy hoặc mảng)
    if (params.product_ids) {
      const ids = Array.isArray(params.product_ids)
        ? params.product_ids.map(String)
        : String(params.product_ids).split(',').map(s => s.trim());
      result = result.filter(item => ids.includes(String(item.id)));
      return {
        data: {
          items: result,
          total: result.length,
          page: 1,
          size: result.length,
          total_pages: 1
        },
        meta: {
          page: 1,
          size: result.length,
          total: result.length,
          total_pages: 1
        }
      };
    }

    // Lọc theo shop_id
    if (params.shop_id) {
      result = result.filter(item => item.shop?.id === params.shop_id || item.shop_projection?.shop_id === params.shop_id);
    }

    // Lọc theo text search q
    if (params.q) {
      const qLower = params.q.trim().toLowerCase();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(qLower)) ||
        (item.title && item.title.toLowerCase().includes(qLower)) ||
        (item.brand && item.brand.toLowerCase().includes(qLower)) ||
        (item.description && item.description.toLowerCase().includes(qLower))
      );
    }

    // Lọc theo danh mục (category_id hoặc category)
    const categoryFilter = params.category_id || params.category;
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(item => 
        item.category === categoryFilter || 
        item.primary_category_id === categoryFilter
      );
    }

    // Lọc theo thương hiệu
    if (params.brand) {
      const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
      if (brands.length > 0) {
        result = result.filter(item => brands.some(b => b.toLowerCase() === item.brand?.toLowerCase()));
      }
    }

    // Lọc khoảng giá
    const minP = params.min_price !== undefined ? params.min_price : params.minPrice;
    if (minP !== undefined && minP !== null && minP !== '') {
      result = result.filter(item => item.price >= Number(minP));
    }
    const maxP = params.max_price !== undefined ? params.max_price : params.maxPrice;
    if (maxP !== undefined && maxP !== null && maxP !== '') {
      result = result.filter(item => item.price <= Number(maxP));
    }

    // Lọc rating
    if (params.rating) {
      result = result.filter(item => item.rating >= Number(params.rating));
    }

    // Lọc official store
    if (params.isOfficial || params.is_official) {
      result = result.filter(item => item.isOfficial);
    }

    // Sắp xếp
    const sort = params.sort || 'popular';
    if (sort === 'sales') {
      result.sort((a, b) => b.soldCount - a.soldCount);
    } else if (sort === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sort === 'price-asc' || sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc' || sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    const page = Number(params.page) || 1;
    const size = Number(params.size) || 20;
    const startIndex = (page - 1) * size;
    const paginatedItems = result.slice(startIndex, startIndex + size);
    const totalPages = Math.ceil(result.length / size) || 1;

    return {
      data: {
        items: paginatedItems,
        total: result.length,
        page,
        size,
        total_pages: totalPages,
        totalPages
      },
      meta: {
        page,
        size,
        total: result.length,
        total_pages: totalPages
      }
    };
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string|number} productId
   */
  getProductById: async (productId) => {
    if (!isMockMode()) {
      return apiClient.get(`/products/${productId}`);
    }

    await new Promise(res => setTimeout(res, 100));
    const strId = String(productId);
    const found = PRODUCTS_CATALOG.find(p => String(p.id) === strId || p.slug === strId);
    if (found) {
      return { data: found };
    }
    return { data: PRODUCTS_CATALOG[0] };
  },

  /**
   * Lấy cây danh mục sản phẩm (Tree view, max depth 5)
   */
  getCategories: async () => {
    if (!isMockMode()) {
      return apiClient.get('/categories');
    }
    return { data: CATEGORIES_TREE };
  },

  /**
   * Lấy chi tiết một danh mục
   * @param {string} categoryId
   */
  getCategoryById: async (categoryId) => {
    if (!isMockMode()) {
      return apiClient.get(`/categories/${categoryId}`);
    }
    const found = CATEGORIES_TREE.find(c => c.id === categoryId || c.slug === categoryId);
    return { data: found || CATEGORIES_TREE[0] };
  },

  /**
   * Lấy danh sách sản phẩm của một shop (shopId là UUID)
   * @param {string} shopId
   * @param {Object} params
   */
  getShopProducts: async (shopId, params = {}) => {
    if (!isMockMode()) {
      return apiClient.get(`/shops/${shopId}/products`, { params });
    }
    return productApi.getProducts({ ...params, shop_id: shopId });
  },

  /**
   * Lấy sản phẩm nổi bật / Flash Sale
   */
  getFlashSaleProducts: async () => {
    if (!isMockMode()) {
      return apiClient.get('/products', { params: { is_flash_sale: true, size: 8 } });
    }
    const flashItems = PRODUCTS_CATALOG.filter(p => p.isFlashSale);
    return { data: flashItems.length > 0 ? flashItems : PRODUCTS_CATALOG.slice(0, 4) };
  }
};

export default productApi;
