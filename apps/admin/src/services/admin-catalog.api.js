import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

// Dữ liệu mẫu chuẩn hóa theo đặc tả product-catalog-docs/docs/api/product-catalog.md
export const MOCK_ADMIN_CATEGORIES = [
  {
    category_id: 'cat-01912f20',
    name: 'Điện tử & Công nghệ',
    slug: 'dien-tu-cong-nghe',
    parent_id: null,
    path: '/cat-01912f20',
    depth: 1,
    status: 'ACTIVE',
    tax_rate_bps: 1000, // 10%
    sort_order: 1,
    version: 1,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f21',
    name: 'Điện thoại & Tablet',
    slug: 'dien-thoai-tablet',
    parent_id: 'cat-01912f20',
    path: '/cat-01912f20/cat-01912f21',
    depth: 2,
    status: 'ACTIVE',
    tax_rate_bps: null, // Kế thừa 10% từ cha
    sort_order: 1,
    version: 2,
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f22',
    name: 'Apple',
    slug: 'dien-thoai-apple',
    parent_id: 'cat-01912f21',
    path: '/cat-01912f20/cat-01912f21/cat-01912f22',
    depth: 3,
    status: 'ACTIVE',
    tax_rate_bps: 1000,
    sort_order: 1,
    version: 3,
    created_at: '2026-08-03T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f23',
    name: 'Samsung',
    slug: 'dien-thoai-samsung',
    parent_id: 'cat-01912f21',
    path: '/cat-01912f20/cat-01912f21/cat-01912f23',
    depth: 3,
    status: 'ACTIVE',
    tax_rate_bps: null,
    sort_order: 2,
    version: 1,
    created_at: '2026-08-03T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f24',
    name: 'Laptop & Máy tính',
    slug: 'laptop-may-tinh',
    parent_id: 'cat-01912f20',
    path: '/cat-01912f20/cat-01912f24',
    depth: 2,
    status: 'ACTIVE',
    tax_rate_bps: null,
    sort_order: 2,
    version: 1,
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f30',
    name: 'Thời trang & Phụ kiện',
    slug: 'thoi-trang-phu-kien',
    parent_id: null,
    path: '/cat-01912f30',
    depth: 1,
    status: 'ACTIVE',
    tax_rate_bps: 800, // 8% VAT
    sort_order: 2,
    version: 1,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f31',
    name: 'Thời trang Nam',
    slug: 'thoi-trang-nam',
    parent_id: 'cat-01912f30',
    path: '/cat-01912f30/cat-01912f31',
    depth: 2,
    status: 'ACTIVE',
    tax_rate_bps: null,
    sort_order: 1,
    version: 1,
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    category_id: 'cat-01912f40',
    name: 'Sức khỏe & Làm đẹp',
    slug: 'suc-khoe-lam-dep',
    parent_id: null,
    path: '/cat-01912f40',
    depth: 1,
    status: 'ACTIVE',
    tax_rate_bps: 1000,
    sort_order: 3,
    version: 1,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-30T09:00:00Z',
  },
];

export const MOCK_ADMIN_PRODUCTS = [
  {
    product_id: 'prod-01912f31',
    title: 'iPhone 16 Pro Max 256GB Titan Sa Mạc',
    slug: 'iphone-16-pro-max-256gb',
    spu_code: 'SPU-IP16PM-256',
    shop_id: 'shop-01912f30',
    shop_name: 'Taca Apple Official Store',
    shop_projection: {
      shop_id: 'shop-01912f30',
      status: 'ACTIVE',
      kyc_status: 'APPROVED',
    },
    category_id: 'cat-01912f22',
    category_name: 'Apple',
    status: 'ACTIVE',
    version: 4,
    risk_level: 'LOW',
    risk_signals: ['Giá hợp lệ', 'SLA giao hàng đạt 99%'],
    price_summary: {
      base_price: 34990000,
      sale_price: 32490000,
      currency: 'VND',
    },
    sku_count: 4,
    skus: [
      {
        sku_id: 'sku-01912f31-1',
        seller_sku: 'IP16PM-256-DESERT',
        attributes: { color: 'Titan Sa Mạc', storage: '256GB' },
        price_override: null,
        status: 'ACTIVE',
        stock_display: { status: 'IN_STOCK', available_qty_snapshot: 45 },
      },
      {
        sku_id: 'sku-01912f31-2',
        seller_sku: 'IP16PM-256-NATURAL',
        attributes: { color: 'Titan Tự Nhiên', storage: '256GB' },
        price_override: null,
        status: 'ACTIVE',
        stock_display: { status: 'IN_STOCK', available_qty_snapshot: 38 },
      },
    ],
    cover_media: {
      media_id: 'med-01',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
    },
    media: [
      {
        media_id: 'med-01',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
        status: 'READY',
        is_cover: true,
      },
    ],
    block_reason: null,
    audit_summary: [
      { action: 'PUBLISH', actor: 'seller-usr-apple', occurred_at: '2026-08-30T09:05:00Z' },
    ],
    created_at: '2026-08-20T08:30:00Z',
    updated_at: '2026-08-30T09:05:00Z',
  },
  {
    product_id: 'prod-01912f32',
    title: 'Serum Phục Hồi Da Cấp Tốc X9 Trị Dứt Điểm Nám',
    slug: 'serum-phuc-hoi-da-x9',
    spu_code: 'SPU-SERUM-X9',
    shop_id: 'shop-01912f35',
    shop_name: 'Luna Beauty Cosmetics',
    shop_projection: {
      shop_id: 'shop-01912f35',
      status: 'ACTIVE',
      kyc_status: 'APPROVED',
    },
    category_id: 'cat-01912f40',
    category_name: 'Sức khỏe & Làm đẹp',
    status: 'BLOCKED',
    version: 3,
    risk_level: 'HIGH',
    risk_signals: ['Claim y tế chữa bệnh', 'Cam kết trị dứt điểm nám'],
    price_summary: {
      base_price: 450000,
      sale_price: 199000,
      currency: 'VND',
    },
    sku_count: 2,
    skus: [
      {
        sku_id: 'sku-01912f32-1',
        seller_sku: 'SRM-X9-30ML',
        attributes: { volume: '30ml' },
        price_override: null,
        status: 'ACTIVE',
        stock_display: { status: 'IN_STOCK', available_qty_snapshot: 120 },
      },
    ],
    cover_media: {
      media_id: 'med-02',
      url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop',
    },
    media: [
      {
        media_id: 'med-02',
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop',
        status: 'READY',
        is_cover: true,
      },
    ],
    block_reason: 'Vi phạm chính sách: Quảng cáo mỹ phẩm có từ ngữ cam kết điều trị dứt điểm (claim y tế)',
    audit_summary: [
      { action: 'PUBLISH', actor: 'seller-usr-luna', occurred_at: '2026-08-25T10:00:00Z' },
      { action: 'BLOCK', actor: 'admin-usr-tran-hoang', occurred_at: '2026-08-29T14:30:00Z', reason: 'Claim y tế chữa bệnh' },
    ],
    created_at: '2026-08-25T09:00:00Z',
    updated_at: '2026-08-29T14:30:00Z',
  },
  {
    product_id: 'prod-01912f33',
    title: 'Giày Sneaker Streetwear Retro Runner 88',
    slug: 'giay-sneaker-streetwear-88',
    spu_code: 'SPU-SNK-88',
    shop_id: 'shop-01912f38',
    shop_name: 'Street Lab Saigon',
    shop_projection: {
      shop_id: 'shop-01912f38',
      status: 'ACTIVE',
      kyc_status: 'APPROVED',
    },
    category_id: 'cat-01912f31',
    category_name: 'Thời trang Nam',
    status: 'INACTIVE',
    version: 2,
    risk_level: 'MEDIUM',
    risk_signals: ['Nghi vấn hình ảnh trùng lặp nhãn hiệu', 'Cần kiểm tra hóa đơn nguồn gốc'],
    price_summary: {
      base_price: 1250000,
      sale_price: 890000,
      currency: 'VND',
    },
    sku_count: 6,
    skus: [
      {
        sku_id: 'sku-01912f33-1',
        seller_sku: 'SNK-88-WHT-41',
        attributes: { color: 'Trắng/Xám', size: '41' },
        price_override: null,
        status: 'ACTIVE',
        stock_display: { status: 'IN_STOCK', available_qty_snapshot: 15 },
      },
    ],
    cover_media: {
      media_id: 'med-03',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    },
    media: [
      {
        media_id: 'med-03',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
        status: 'READY',
        is_cover: true,
      },
    ],
    block_reason: null,
    audit_summary: [
      { action: 'PUBLISH', actor: 'seller-usr-streetlab', occurred_at: '2026-08-28T16:00:00Z' },
      { action: 'UNPUBLISH', actor: 'admin-usr-tran-hoang', occurred_at: '2026-08-30T08:15:00Z' },
    ],
    created_at: '2026-08-28T15:30:00Z',
    updated_at: '2026-08-30T08:15:00Z',
  },
  {
    product_id: 'prod-01912f34',
    title: 'Áo Khoác Gió Kháng Nước Cotton Blend Unisex',
    slug: 'ao-khoac-gio-khang-nuoc',
    spu_code: 'SPU-JKT-COTTON',
    shop_id: 'shop-01912f30',
    shop_name: 'Taca Fashion Hub',
    shop_projection: {
      shop_id: 'shop-01912f30',
      status: 'ACTIVE',
      kyc_status: 'APPROVED',
    },
    category_id: 'cat-01912f31',
    category_name: 'Thời trang Nam',
    status: 'ACTIVE',
    version: 5,
    risk_level: 'LOW',
    risk_signals: ['Giá cạnh tranh', 'Nội dung chuẩn SEO'],
    price_summary: {
      base_price: 399000,
      sale_price: 299000,
      currency: 'VND',
    },
    sku_count: 3,
    skus: [
      {
        sku_id: 'sku-01912f34-1',
        seller_sku: 'JKT-BLK-L',
        attributes: { color: 'Đen', size: 'L' },
        price_override: null,
        status: 'ACTIVE',
        stock_display: { status: 'IN_STOCK', available_qty_snapshot: 60 },
      },
    ],
    cover_media: {
      media_id: 'med-04',
      url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop',
    },
    media: [
      {
        media_id: 'med-04',
        url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop',
        status: 'READY',
        is_cover: true,
      },
    ],
    block_reason: null,
    audit_summary: [
      { action: 'PUBLISH', actor: 'seller-usr-taca', occurred_at: '2026-08-29T11:00:00Z' },
    ],
    created_at: '2026-08-29T10:30:00Z',
    updated_at: '2026-08-29T11:00:00Z',
  },
];

let localProducts = [...MOCK_ADMIN_PRODUCTS];
let localCategories = [...MOCK_ADMIN_CATEGORIES];

export const adminCatalogApi = {
  // ==========================================
  // NHÓM 1: ADMIN PRODUCT MODERATION (STT 17 - 20)
  // ==========================================

  /**
   * STT 17: GET /admin/catalog/products
   * Quản trị & kiểm duyệt danh sách sản phẩm toàn sàn
   * @param {Object} params - { page, size, status, shop_id, category_id, q, updated_from, updated_to }
   */
  getAdminProducts: async (params = {}) => {
    const {
      page = 1,
      size = 20,
      status,
      shop_id,
      category_id,
      q,
      updated_from,
      updated_to,
    } = params;

    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/catalog/products', {
          params: { page, size, status, shop_id, category_id, q, updated_from, updated_to },
        });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/catalog/products failed, using mock fallback', err);
      }
    }

    await new Promise((res) => setTimeout(res, 120));

    let filtered = [...localProducts];

    if (status && status !== 'ALL') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (shop_id) {
      filtered = filtered.filter((p) => p.shop_id === shop_id);
    }
    if (category_id) {
      filtered = filtered.filter((p) => p.category_id === category_id);
    }
    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(qLower) ||
          p.spu_code?.toLowerCase().includes(qLower) ||
          p.shop_name?.toLowerCase().includes(qLower)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * size;
    const paginated = filtered.slice(startIndex, startIndex + size);

    return {
      data: paginated,
      meta: {
        page: Number(page),
        size: Number(size),
        total,
        total_pages: Math.ceil(total / size) || 1,
        request_id: `req-${Date.now()}`,
      },
    };
  },

  /**
   * STT 18: GET /admin/catalog/products/{productId}
   * Xem chi tiết sản phẩm bất kể public visibility
   * @param {string} productId
   */
  getAdminProductById: async (productId) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get(`/admin/catalog/products/${productId}`);
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway GET /admin/catalog/products/${productId} failed, using mock`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 80));
    const found = localProducts.find((p) => p.product_id === productId);
    if (!found) {
      const error = new Error('PRODUCT_NOT_FOUND');
      error.response = { status: 404, data: { error: { code: 'PRODUCT_NOT_FOUND', message: 'Sản phẩm không tồn tại.' } } };
      throw error;
    }

    return {
      data: found,
      meta: { request_id: `req-${Date.now()}` },
    };
  },

  /**
   * STT 19: POST /admin/catalog/products/{productId}/block
   * Khóa sản phẩm vi phạm chính sách sau xuất bản (Post-publication block)
   * @param {string} productId
   * @param {Object} payload - { version: number, reason: string }
   */
  blockProduct: async (productId, { version = 1, reason = '' } = {}) => {
    if (!reason?.trim()) {
      throw new Error('Lý do khóa sản phẩm (reason) là bắt buộc theo quy định kiểm duyệt.');
    }

    if (!isMockMode()) {
      try {
        const response = await apiClient.post(`/admin/catalog/products/${productId}/block`, {
          version: Number(version),
          reason: reason.trim(),
        });
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway POST /admin/catalog/products/${productId}/block failed, using mock`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    const target = localProducts.find((p) => p.product_id === productId);
    if (target) {
      target.status = 'BLOCKED';
      target.version = (target.version || Number(version)) + 1;
      target.block_reason = reason.trim();
      target.updated_at = new Date().toISOString();
      target.audit_summary = target.audit_summary || [];
      target.audit_summary.push({
        action: 'BLOCK',
        actor: 'admin-usr-current',
        occurred_at: new Date().toISOString(),
        reason: reason.trim(),
      });
      return {
        data: {
          product_id: target.product_id,
          status: 'BLOCKED',
          blocked_at: new Date().toISOString(),
          version: target.version,
        },
        meta: { request_id: `req-${Date.now()}` },
      };
    }

    return {
      data: { product_id: productId, status: 'BLOCKED', version: Number(version) + 1 },
      meta: { request_id: `req-${Date.now()}` },
    };
  },

  /**
   * STT 20: POST /admin/catalog/products/{productId}/unblock
   * Mở khóa an toàn sản phẩm về trạng thái INACTIVE để seller kiểm tra & publish lại
   * @param {string} productId
   * @param {Object} payload - { version: number, reason: string }
   */
  unblockProduct: async (productId, { version = 1, reason = '' } = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.post(`/admin/catalog/products/${productId}/unblock`, {
          version: Number(version),
          reason: reason ? reason.trim() : 'Đã xác minh khắc phục vi phạm',
        });
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway POST /admin/catalog/products/${productId}/unblock failed, using mock`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    const target = localProducts.find((p) => p.product_id === productId);
    if (target) {
      target.status = 'INACTIVE';
      target.version = (target.version || Number(version)) + 1;
      target.block_reason = null;
      target.updated_at = new Date().toISOString();
      target.audit_summary = target.audit_summary || [];
      target.audit_summary.push({
        action: 'UNBLOCK',
        actor: 'admin-usr-current',
        occurred_at: new Date().toISOString(),
        reason: reason || 'Mở khóa an toàn về INACTIVE',
      });
      return {
        data: {
          product_id: target.product_id,
          status: 'INACTIVE',
          next_status: 'INACTIVE',
          version: target.version,
        },
        meta: { request_id: `req-${Date.now()}` },
      };
    }

    return {
      data: { product_id: productId, status: 'INACTIVE', next_status: 'INACTIVE', version: Number(version) + 1 },
      meta: { request_id: `req-${Date.now()}` },
    };
  },

  // ==========================================
  // NHÓM 2: ADMIN CATEGORY TAXONOMY (STT 21 - 24)
  // ==========================================

  /**
   * STT 21: GET /admin/catalog/categories
   * Quản trị taxonomy, hiển thị toàn bộ cây danh mục active/inactive/archived
   * @param {Object} params - { status, parent_id, page, size }
   */
  getAdminCategories: async (params = {}) => {
    const { status, parent_id, page = 1, size = 50 } = params;

    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/catalog/categories', {
          params: { status, parent_id, page, size },
        });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/catalog/categories failed, using mock fallback', err);
      }
    }

    await new Promise((res) => setTimeout(res, 100));

    let list = [...localCategories];
    if (status && status !== 'ALL') {
      list = list.filter((c) => c.status === status);
    }
    if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
      list = list.filter((c) => c.parent_id === parent_id);
    }

    return {
      data: list,
      meta: {
        page: Number(page),
        size: Number(size),
        total: list.length,
        total_pages: Math.ceil(list.length / size) || 1,
        request_id: `req-${Date.now()}`,
      },
    };
  },

  /**
   * STT 22: POST /admin/catalog/categories
   * Tạo danh mục mới trong hệ thống
   * Ràng buộc: Root category (parent_id: null) bắt buộc có tax_rate_bps (0..10000)
   * @param {Object} payload - { parent_id, name, slug, sort_order, tax_rate_bps }
   */
  createCategory: async (payload) => {
    if (!payload.name?.trim()) {
      throw new Error('Tên danh mục là bắt buộc.');
    }
    const isRoot = !payload.parent_id;
    if (isRoot && (payload.tax_rate_bps === null || payload.tax_rate_bps === undefined)) {
      throw new Error('Danh mục gốc bắt buộc phải có thuế suất VAT (tax_rate_bps).');
    }

    if (!isMockMode()) {
      try {
        const response = await apiClient.post('/admin/catalog/categories', {
          parent_id: payload.parent_id || null,
          name: payload.name.trim(),
          slug: payload.slug?.trim() || payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
          sort_order: Number(payload.sort_order) || 1,
          tax_rate_bps: payload.tax_rate_bps !== undefined && payload.tax_rate_bps !== null
            ? Number(payload.tax_rate_bps)
            : null,
        });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway POST /admin/catalog/categories failed, using mock', err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));

    // Tìm parent để tính path & depth
    let parentCategory = null;
    if (payload.parent_id) {
      parentCategory = localCategories.find((c) => c.category_id === payload.parent_id);
    }

    const newId = `cat-${Date.now()}`;
    const depth = parentCategory ? parentCategory.depth + 1 : 1;
    const path = parentCategory ? `${parentCategory.path}/${newId}` : `/${newId}`;

    const newCat = {
      category_id: newId,
      name: payload.name.trim(),
      slug: payload.slug?.trim() || payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
      parent_id: payload.parent_id || null,
      path,
      depth,
      status: 'ACTIVE',
      tax_rate_bps: payload.tax_rate_bps !== undefined && payload.tax_rate_bps !== null
        ? Number(payload.tax_rate_bps)
        : null,
      sort_order: Number(payload.sort_order) || 1,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localCategories.push(newCat);

    return {
      data: newCat,
      meta: { request_id: `req-${Date.now()}` },
    };
  },

  /**
   * STT 23: PATCH /admin/catalog/categories/{categoryId}
   * Cập nhật thông tin danh mục, di chuyển subtree hoặc cập nhật thuế VAT
   * @param {string} categoryId
   * @param {Object} payload - { version, parent_id, name, slug, status, tax_rate_bps }
   */
  updateCategory: async (categoryId, payload) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.patch(`/admin/catalog/categories/${categoryId}`, payload);
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway PATCH /admin/catalog/categories/${categoryId} failed, using mock`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 120));
    const target = localCategories.find((c) => c.category_id === categoryId);
    if (!target) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    if (payload.name) target.name = payload.name.trim();
    if (payload.slug) target.slug = payload.slug.trim();
    if (payload.status) target.status = payload.status;
    if (payload.tax_rate_bps !== undefined) {
      target.tax_rate_bps = payload.tax_rate_bps === null ? null : Number(payload.tax_rate_bps);
    }
    if (payload.parent_id !== undefined && payload.parent_id !== target.parent_id) {
      target.parent_id = payload.parent_id || null;
      const parent = localCategories.find((c) => c.category_id === target.parent_id);
      target.depth = parent ? parent.depth + 1 : 1;
      target.path = parent ? `${parent.path}/${target.category_id}` : `/${target.category_id}`;
    }
    target.version = (target.version || 1) + 1;
    target.updated_at = new Date().toISOString();

    return {
      data: target,
      meta: { request_id: `req-${Date.now()}` },
    };
  },

  /**
   * STT 24: POST /admin/catalog/categories/{categoryId}/archive
   * Lưu trữ mềm danh mục (Soft archive category)
   * @param {string} categoryId
   * @param {Object} payload - { version: number, reason: string }
   */
  archiveCategory: async (categoryId, { version = 1, reason = '' } = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.post(`/admin/catalog/categories/${categoryId}/archive`, {
          version: Number(version),
          reason: reason ? reason.trim() : 'Taxonomy mới',
        });
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway POST /admin/catalog/categories/${categoryId}/archive failed, using mock`, err);
      }
    }

    await new Promise((res) => setTimeout(res, 120));
    const target = localCategories.find((c) => c.category_id === categoryId);
    if (target) {
      target.status = 'ARCHIVED';
      target.version = (target.version || Number(version)) + 1;
      target.updated_at = new Date().toISOString();
      return {
        data: {
          category_id: target.category_id,
          status: 'ARCHIVED',
          version: target.version,
        },
        meta: { request_id: `req-${Date.now()}` },
      };
    }

    return {
      data: { category_id: categoryId, status: 'ARCHIVED', version: Number(version) + 1 },
      meta: { request_id: `req-${Date.now()}` },
    };
  },
};

export default adminCatalogApi;
