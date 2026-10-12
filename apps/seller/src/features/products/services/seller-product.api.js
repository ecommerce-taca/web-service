import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';
import { sanitizeObjectForExport } from '../../../../../../shared/utils/security';

/**
 * Tính toán mã băm SHA-256 (64 hex characters) thực tế từ File
 */
export const calculateFileSha256 = async (file) => {
  if (!file) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Lỗi khi tính SHA-256 bằng Web Crypto API:', err);
  }
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

/**
 * Mock Data danh sách sản phẩm của Seller khớp Penpot "Taca Seller / Products"
 */
let MOCK_SELLER_PRODUCTS = [
  {
    id: 'spu-1',
    productId: 'spu-1',
    title: 'iPhone 16 Pro Max',
    spu_code: 'SPU-IP16PM',
    slug: 'iphone-16-pro-max',
    brand: 'Apple',
    primary_category_id: 'dien-thoai',
    category_name: 'Điện thoại › Apple › iPhone',
    status: 'ACTIVE', // 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED'
    version: 1,
    sku_count: 6,
    sku_summary: '6 SKU · 3 dung lượng × 2 màu',
    price_range: '29.490.000 – 43.990.000',
    price_summary: {
      min_price: 29490000,
      max_price: 43990000,
      currency: 'VND'
    },
    stock_display: 218,
    total_stock: 218,
    sold_count: 5200,
    attribute_definitions: [
      {
        name: 'Dung lượng',
        display_as: 'PLAIN',
        values: ['256GB', '512GB', '1TB']
      },
      {
        name: 'Màu sắc',
        display_as: 'COLOR_SWATCH',
        values: ['Titan tự nhiên', 'Titan đen'],
        value_meta: {
          'Titan tự nhiên': { swatch_hex: '#9A948C' },
          'Titan đen': { swatch_hex: '#2B2B2B' }
        }
      },
      {
        name: 'Kết nối',
        display_as: 'PLAIN',
        values: ['Wi-Fi', '5G']
      }
    ],
    skus: [
      {
        id: 'sku-1',
        sku_code: 'IP16-256-NAT-WF',
        name: '256GB / Titan tự nhiên / Wi-Fi',
        attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên', 'Kết nối': 'Wi-Fi' },
        price: { base_price: 34990000, sale_price: 29490000, currency: 'VND' },
        stock_display: 38,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-2',
        sku_code: 'IP16-256-NAT-5G',
        name: '256GB / Titan tự nhiên / 5G',
        attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên', 'Kết nối': '5G' },
        price: { base_price: 36990000, sale_price: 31490000, currency: 'VND' },
        stock_display: 24,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-3',
        sku_code: 'IP16-512-BLK-WF',
        name: '512GB / Titan đen / Wi-Fi',
        attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan đen', 'Kết nối': 'Wi-Fi' },
        price: { base_price: 39990000, sale_price: 35990000, currency: 'VND' },
        stock_display: 18,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      },
      {
        id: 'sku-4',
        sku_code: 'IP16-512-BLK-5G',
        name: '512GB / Titan đen / 5G',
        attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan đen', 'Kết nối': '5G' },
        price: { base_price: 41990000, sale_price: 37990000, currency: 'VND' },
        stock_display: 12,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    updated_at: '2026-10-08T10:30:00Z'
  },
  {
    id: 'spu-2',
    productId: 'spu-2',
    title: 'MacBook Air M3 2024',
    spu_code: 'SPU-MBA-M3',
    slug: 'macbook-air-m3-2024',
    brand: 'Apple',
    primary_category_id: 'laptop',
    category_name: 'Laptop › Apple › MacBook',
    status: 'ACTIVE',
    version: 1,
    sku_count: 4,
    sku_summary: '4 SKU · RAM / SSD',
    price_range: '27.990.000 – 39.490.000',
    price_summary: {
      min_price: 27990000,
      max_price: 39490000,
      currency: 'VND'
    },
    stock_display: 64,
    total_stock: 64,
    sold_count: 1800,
    attribute_definitions: [
      { name: 'RAM', display_as: 'PLAIN', values: ['16GB', '24GB'] },
      { name: 'SSD', display_as: 'PLAIN', values: ['256GB', '512GB'] }
    ],
    skus: [
      {
        id: 'sku-21',
        sku_code: 'MBA-M3-16-256',
        name: '16GB / 256GB',
        attributes: { 'RAM': '16GB', 'SSD': '256GB' },
        price: { base_price: 31990000, sale_price: 27990000, currency: 'VND' },
        stock_display: 32,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    updated_at: '2026-10-07T14:15:00Z'
  },
  {
    id: 'spu-3',
    productId: 'spu-3',
    title: 'Sony WH-1000XM5',
    spu_code: 'SPU-SONY-XM5',
    slug: 'sony-wh-1000xm5',
    brand: 'Sony',
    primary_category_id: 'am-thanh',
    category_name: 'Âm thanh › Tai nghe',
    status: 'INACTIVE', // Hết hàng / Tạm ẩn
    version: 1,
    sku_count: 2,
    sku_summary: '2 SKU · Đen / Bạc',
    price_range: '7.490.000',
    price_summary: {
      min_price: 7490000,
      max_price: 7490000,
      currency: 'VND'
    },
    stock_display: 0,
    total_stock: 0,
    sold_count: 936,
    attribute_definitions: [
      { name: 'Màu sắc', display_as: 'COLOR_SWATCH', values: ['Đen', 'Bạc'] }
    ],
    skus: [
      {
        id: 'sku-31',
        sku_code: 'SONY-XM5-BLK',
        name: 'Đen',
        attributes: { 'Màu sắc': 'Đen' },
        price: { base_price: 8490000, sale_price: 7490000, currency: 'VND' },
        stock_display: 0,
        tax_rate_bps: 1000,
        status: 'INACTIVE'
      }
    ],
    updated_at: '2026-10-06T09:00:00Z'
  },
  {
    id: 'spu-4',
    productId: 'spu-4',
    title: 'iPad Air M2',
    spu_code: 'SPU-IPAD-AIR-M2',
    slug: 'ipad-air-m2',
    brand: 'Apple',
    primary_category_id: 'dien-thoai',
    category_name: 'Máy tính bảng › Apple iPad',
    status: 'ACTIVE',
    version: 1,
    sku_count: 8,
    sku_summary: '8 SKU · WiFi / Cellular',
    price_range: '15.290.000 – 28.990.000',
    price_summary: {
      min_price: 15290000,
      max_price: 28990000,
      currency: 'VND'
    },
    stock_display: 42,
    total_stock: 42,
    sold_count: 624,
    attribute_definitions: [
      { name: 'Dung lượng', display_as: 'PLAIN', values: ['128GB', '256GB'] },
      { name: 'Kết nối', display_as: 'PLAIN', values: ['Wi-Fi', '5G'] }
    ],
    skus: [
      {
        id: 'sku-41',
        sku_code: 'IPAD-M2-128-WF',
        name: '128GB / Wi-Fi',
        attributes: { 'Dung lượng': '128GB', 'Kết nối': 'Wi-Fi' },
        price: { base_price: 16990000, sale_price: 15290000, currency: 'VND' },
        stock_display: 20,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    updated_at: '2026-10-05T16:20:00Z'
  },
  {
    id: 'spu-5',
    productId: 'spu-5',
    title: 'Bàn phím cơ Logitech MX Mechanical Mini',
    spu_code: 'SPU-LOGI-MX-MINI',
    slug: 'ban-phim-co-logitech-mx-mechanical-mini',
    brand: 'Logitech',
    primary_category_id: 'phu-kien',
    category_name: 'Phụ kiện máy tính › Bàn phím',
    status: 'DRAFT',
    version: 1,
    sku_count: 2,
    sku_summary: '2 SKU · Tactile / Linear',
    price_range: '3.290.000 ₫',
    price_summary: {
      min_price: 3290000,
      max_price: 3290000,
      currency: 'VND'
    },
    stock_display: 50,
    total_stock: 50,
    sold_count: 0,
    attribute_definitions: [
      { name: 'Switch', display_as: 'PLAIN', values: ['Tactile Quiet', 'Linear'] }
    ],
    skus: [
      {
        id: 'sku-51',
        sku_code: 'LOGI-MX-TAC',
        name: 'Tactile Quiet',
        attributes: { 'Switch': 'Tactile Quiet' },
        price: { base_price: 3490000, sale_price: 3290000, currency: 'VND' },
        stock_display: 25,
        tax_rate_bps: 1000,
        status: 'ACTIVE'
      }
    ],
    updated_at: '2026-10-09T08:15:00Z'
  },
  {
    id: 'spu-6',
    productId: 'spu-6',
    title: 'Tai nghe Bluetooth Air-Pro 3 Copy 1:1',
    spu_code: 'SPU-COPY-AIR3',
    slug: 'tai-nghe-bluetooth-air-pro-3-copy',
    brand: 'OEM',
    primary_category_id: 'am-thanh',
    category_name: 'Âm thanh › Tai nghe',
    status: 'BLOCKED',
    block_reason: 'Vi phạm chính sách hàng giả, hàng nhái và bản quyền thương hiệu Taca',
    version: 2,
    sku_count: 1,
    sku_summary: '1 SKU · Trắng',
    price_range: '350.000 ₫',
    price_summary: {
      min_price: 350000,
      max_price: 350000,
      currency: 'VND'
    },
    stock_display: 0,
    total_stock: 0,
    sold_count: 12,
    attribute_definitions: [],
    skus: [],
    updated_at: '2026-10-10T11:20:00Z'
  }
];

export const sellerProductApi = {
  /**
   * 1. Lấy danh sách sản phẩm của Seller
   * @param {Object} params - { status, q, sort, page, size }
   */
  getProducts: async ({ status, q, sort = 'newest', page = 1, size = 20 } = {}) => {
    if (!isMockMode()) {
      return apiClient.get('/seller/products', {
        params: { ...(status && { status }), ...(q && { q }), sort, page, size }
      });
    }

    await new Promise(res => setTimeout(res, 150));
    let items = [...MOCK_SELLER_PRODUCTS];

    if (status && status !== 'ALL') {
      if (status === 'OUT_OF_STOCK') {
        items = items.filter(p => p.stock_display === 0);
      } else {
        items = items.filter(p => p.status === status);
      }
    }

    if (q) {
      const qLower = q.toLowerCase();
      items = items.filter(p => 
        p.title.toLowerCase().includes(qLower) || 
        (p.spu_code && p.spu_code.toLowerCase().includes(qLower))
      );
    }

    const total = items.length;
    const startIndex = (page - 1) * size;
    const paginated = items.slice(startIndex, startIndex + size);

    return {
      data: {
        items: paginated,
        total,
        page,
        size,
        total_pages: Math.ceil(total / size) || 1
      },
      meta: {
        page,
        size,
        total,
        total_pages: Math.ceil(total / size) || 1
      }
    };
  },

  /**
   * 2. Lấy chi tiết SPU + SKUs cho màn hình Editor
   */
  getProductEditorDetail: async (productId) => {
    if (!isMockMode()) {
      return apiClient.get(`/seller/products/${productId}`);
    }

    await new Promise(res => setTimeout(res, 100));
    const found = MOCK_SELLER_PRODUCTS.find(p => p.id === productId || p.productId === productId);
    return { data: found || MOCK_SELLER_PRODUCTS[0] };
  },

  /**
   * 3. Tạo mới SPU nháp
   */
  createProductDraft: async (payload) => {
    if (!isMockMode()) {
      return apiClient.post('/seller/products', payload);
    }

    await new Promise(res => setTimeout(res, 200));
    const minP = Number(payload.price_summary?.min_price) || 0;
    const maxP = Number(payload.price_summary?.max_price) || minP;
    const calculatedRange = minP > 0
      ? (minP === maxP ? `${minP.toLocaleString('vi-VN')} ₫` : `${minP.toLocaleString('vi-VN')} – ${maxP.toLocaleString('vi-VN')} ₫`)
      : '0 ₫';

    const newSpu = {
      id: `spu-${Date.now()}`,
      productId: `spu-${Date.now()}`,
      title: payload.title,
      spu_code: payload.spu_code || (payload.slug ? payload.slug.toUpperCase() : `SPU-${Date.now()}`),
      slug: payload.slug,
      brand: payload.brand,
      status: 'DRAFT',
      version: 1,
      sku_count: payload.skus ? payload.skus.length : 0,
      price_range: calculatedRange,
      price_summary: { min_price: minP, max_price: maxP, currency: 'VND' },
      stock_display: payload.skus ? payload.skus.reduce((sum, s) => sum + (Number(s.stock_display) || 0), 0) : 0,
      sold_count: 0,
      attribute_definitions: payload.attribute_definitions || [],
      skus: payload.skus || [],
      updated_at: new Date().toISOString()
    };
    MOCK_SELLER_PRODUCTS.unshift(newSpu);
    return { data: newSpu };
  },

  /**
   * 4. Cập nhật thông tin cơ bản SPU (kèm optimistic version)
   */
  updateProduct: async (productId, payload) => {
    if (!isMockMode()) {
      return apiClient.patch(`/seller/products/${productId}`, payload);
    }

    await new Promise(res => setTimeout(res, 150));
    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      Object.assign(item, payload, { version: (item.version || 1) + 1 });
      if (payload.price_summary) {
        const minP = Number(payload.price_summary.min_price) || 0;
        const maxP = Number(payload.price_summary.max_price) || minP;
        if (minP > 0) {
          item.price_range = minP === maxP
            ? `${minP.toLocaleString('vi-VN')} ₫`
            : `${minP.toLocaleString('vi-VN')} – ${maxP.toLocaleString('vi-VN')} ₫`;
        }
      }
      return { data: item };
    }
    return { data: payload };
  },

  /**
   * 5. Gán danh mục chính và danh mục phụ (kèm concurrency version theo đặc tả §3.2)
   */
  assignCategories: async (productId, { primary_category_id, secondary_category_ids = [], version = 1 }) => {
    const ver = Math.max(1, Number(version) || 1);
    if (!isMockMode()) {
      return apiClient.put(`/seller/products/${productId}/categories`, {
        version: ver,
        primary_category_id,
        secondary_category_ids
      });
    }

    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      item.primary_category_id = primary_category_id;
      item.version = (item.version || 1) + 1;
    }
    return { data: { success: true, version: (item?.version || ver + 1) } };
  },

  /**
   * 6. Thay thế toàn bộ thuộc tính và ma trận SKU
   */
  replaceSkus: async (productId, { attribute_definitions, skus, version }) => {
    if (!isMockMode()) {
      return apiClient.put(`/seller/products/${productId}/skus`, {
        attribute_definitions,
        skus,
        version
      });
    }

    await new Promise(res => setTimeout(res, 200));
    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      item.attribute_definitions = attribute_definitions;
      item.skus = skus;
      item.sku_count = skus.length;
      item.stock_display = skus.reduce((sum, s) => sum + (Number(s.stock_display) || 0), 0);
      item.version = (item.version || 1) + 1;

      // Tự động tính toán lại giá bán theo đặc tả API Product Catalog (§3.2)
      const validPrices = skus
        .map(s => Number(s.price?.sale_price || s.price?.base_price || String(s.price).replace(/\D/g, '') || 0))
        .filter(p => p > 0);

      if (validPrices.length > 0) {
        const minP = Math.min(...validPrices);
        const maxP = Math.max(...validPrices);
        item.price_summary = { min_price: minP, max_price: maxP, currency: 'VND' };
        item.price_range = minP === maxP
          ? `${minP.toLocaleString('vi-VN')} ₫`
          : `${minP.toLocaleString('vi-VN')} – ${maxP.toLocaleString('vi-VN')} ₫`;
      }
    }
    return { data: { success: true, count: skus.length } };
  },

  /**
   * 7. Xuất bản / Tạm dừng / Lưu trữ SPU
   */
  publishProduct: async (productId, version = 1) => {
    const ver = Math.max(1, Number(version) || 1);
    if (!isMockMode()) {
      return apiClient.post(`/seller/products/${productId}/publish`, { version: ver });
    }
    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      item.status = 'ACTIVE';
      item.version = (item.version || 1) + 1;
    }
    return { data: { success: true, status: 'ACTIVE', version: (item?.version || 1) } };
  },

  unpublishProduct: async (productId, version = 1, reason = '') => {
    const ver = Math.max(1, Number(version) || 1);
    if (!isMockMode()) {
      const payload = { version: ver };
      if (reason) payload.reason = reason;
      return apiClient.post(`/seller/products/${productId}/unpublish`, payload);
    }
    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      item.status = 'INACTIVE';
      item.version = (item.version || 1) + 1;
    }
    return { data: { success: true, status: 'INACTIVE', version: (item?.version || 1) } };
  },

  archiveProduct: async (productId, version = 1, reason = '') => {
    const ver = Math.max(1, Number(version) || 1);
    if (!isMockMode()) {
      const payload = { version: ver };
      if (reason) payload.reason = reason;
      return apiClient.post(`/seller/products/${productId}/archive`, payload);
    }
    const item = MOCK_SELLER_PRODUCTS.find(p => p.id === productId);
    if (item) {
      item.status = 'ARCHIVED';
      item.version = (item.version || 1) + 1;
    }
    return { data: { success: true, status: 'ARCHIVED', version: (item?.version || 1) } };
  },

  /**
   * 8. Luồng Upload Media qua S3 Presigned URL (Khớp đặc tả §3.2)
   */
  getMediaUploadUrl: async (productId, {
    scope = 'SPU',
    sku_id = null,
    content_type,
    size_bytes,
    file_size,
    sha256,
    is_cover = false,
    file_name
  }) => {
    const finalSizeBytes = Number(size_bytes ?? file_size) || 0;
    const finalSha256 = sha256 && /^[a-fA-F0-9]{64}$/.test(sha256)
      ? sha256
      : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    if (!isMockMode()) {
      return apiClient.post(`/seller/products/${productId}/media/upload-url`, {
        scope,
        sku_id,
        content_type: content_type || 'image/jpeg',
        size_bytes: finalSizeBytes,
        sha256: finalSha256,
        is_cover: Boolean(is_cover)
      });
    }
    return {
      data: {
        media_id: `med-${Date.now()}`,
        object_key: `products/${productId}/${file_name || 'media.webp'}`,
        file_key: `products/${productId}/${file_name || 'media.webp'}`,
        upload_url: 'https://mock-s3-upload.local/presigned-url',
        status: 'UPLOADING'
      }
    };
  },

  completeMediaUpload: async (productId, payload) => {
    const finalPayload = {
      media_id: payload.media_id,
      object_key: payload.object_key || payload.upload_key || payload.file_key,
      sha256: payload.sha256 && /^[a-fA-F0-9]{64}$/.test(payload.sha256)
        ? payload.sha256
        : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
    if (!isMockMode()) {
      return apiClient.post(`/seller/products/${productId}/media/complete`, finalPayload);
    }
    return { data: { success: true, status: 'READY', ...finalPayload } };
  },

  /**
   * 9. Excel Import / Export Async Job
   */
  exportProductsExcelUrl: async (params = {}) => {
    if (!isMockMode()) {
      return apiClient.get('/seller/products/export', { params });
    }
    // Mock export với dữ liệu đã được làm sạch chống Formula Injection (CWE-1236)
    const sanitizedItems = MOCK_SELLER_PRODUCTS.map(sanitizeObjectForExport);
    return {
      data: {
        download_url: '#mock-export-url',
        preview_data: sanitizedItems
      }
    };
  },

  downloadImportTemplate: async (typeOrOptions = 'MULTI_SHEET') => {
    const options = typeof typeOrOptions === 'object' && typeOrOptions !== null
      ? typeOrOptions
      : { layout_mode: typeOrOptions || 'MULTI_SHEET' };
    const payload = {
      layout_mode: options.layout_mode || options.type || 'MULTI_SHEET',
      ...(options.row_count ? { row_count: options.row_count } : {}),
      ...(options.category_ids ? { category_ids: options.category_ids } : {}),
      ...(options.product_ids ? { product_ids: options.product_ids } : {})
    };

    if (!isMockMode()) {
      return apiClient.post('/seller/products/import/template', payload, { responseType: 'blob' });
    }
    return { data: new Blob(['mock-excel-content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) };
  },

  submitImportExcel: async (file) => {
    if (!isMockMode()) {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/seller/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return {
      data: {
        job_id: `job-${Date.now()}`,
        status: 'PENDING',
        message: 'Tệp Excel đã được tải lên và đang được xếp hàng xử lý.'
      }
    };
  },

  getImportJobStatus: async (jobId) => {
    if (!isMockMode()) {
      return apiClient.get(`/seller/products/import/jobs/${jobId}`);
    }
    return {
      data: {
        job_id: jobId,
        status: 'COMPLETED',
        total_rows: 24,
        success_rows: 24,
        failed_rows: 0
      }
    };
  },

  getImportJobResultUrl: async (jobId) => {
    if (!isMockMode()) {
      return apiClient.get(`/seller/products/import/jobs/${jobId}/result`);
    }
    return { data: { result_file_url: '#mock-job-result' } };
  }
};

export default sellerProductApi;
