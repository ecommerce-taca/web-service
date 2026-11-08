/**
 * Chuẩn hóa dữ liệu sản phẩm từ Backend NestJS sang Model thống nhất cho Frontend
 * Hỗ trợ tương thích đồng thời cả response Backend chuẩn ({ product_id, title, media, price_summary })
 * và Mock Fixtures ({ id, name, images }).
 * 
 * Đảm bảo tính nhất quán giữa 3 phân hệ: Buyer, Seller, Admin.
 */

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  BLOCKED: 'BLOCKED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
};

export const PRODUCT_STATUS_LABELS = {
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  PUBLISHED: 'Đang bán',
  ACTIVE: 'Đang bán',
  UNPUBLISHED: 'Tạm dừng bán',
  INACTIVE: 'Tạm dừng bán',
  BLOCKED: 'Đã bị khóa',
  REJECTED: 'Bị từ chối',
  ARCHIVED: 'Đã lưu trữ',
};

/**
 * Chuẩn hóa một sản phẩm đơn lẻ
 * @param {Object} raw - Dữ liệu thô từ BE hoặc Mock
 * @returns {Object} Product object chuẩn hóa
 */
export const normalizeProduct = (raw = {}) => {
  if (!raw) return null;
  const mediaList = raw.media || [];
  const coverMedia = mediaList.find(m => m.is_cover)?.url 
    || mediaList[0]?.url 
    || raw.image 
    || (Array.isArray(raw.images) ? raw.images[0] : null);

  const rawPriceSummary = raw.price_summary || {};
  const basePrice = Number(rawPriceSummary.base_price || raw.price || raw.originalPrice || 0);
  const salePrice = Number(rawPriceSummary.sale_price || raw.sale_price || raw.price || basePrice);

  return {
    id: String(raw.product_id || raw.id || raw._id || ''),
    productId: String(raw.product_id || raw.id || raw._id || ''),
    product_id: String(raw.product_id || raw.id || raw._id || ''),
    title: raw.title || raw.name || 'Sản phẩm không có tên',
    name: raw.title || raw.name || 'Sản phẩm không có tên',
    slug: raw.slug || '',
    brand: raw.brand || '',
    description: raw.description || '',
    price: salePrice > 0 ? salePrice : basePrice,
    originalPrice: basePrice > 0 ? basePrice : salePrice,
    price_summary: {
      base_price: basePrice,
      sale_price: salePrice > 0 ? salePrice : basePrice,
      currency: rawPriceSummary.currency || 'VND'
    },
    coverImage: coverMedia || 'https://placehold.co/400',
    image: coverMedia || 'https://placehold.co/400',
    images: mediaList.length > 0 
      ? mediaList.map(m => m.url) 
      : (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [coverMedia || 'https://placehold.co/400']),
    media: mediaList,
    primary_category_id: raw.primary_category_id || raw.category_id || raw.categoryId || raw.category || '',
    category_id: raw.category_id || raw.categoryId || raw.primary_category_id || raw.category || '',
    category: raw.category || raw.primary_category_id || '',
    secondary_category_ids: raw.secondary_category_ids || [],
    rating: Number(raw.rating_summary?.avg || raw.rating || 0),
    ratingCount: Number(raw.rating_summary?.count || raw.reviewCount || 0),
    reviewCount: Number(raw.rating_summary?.count || raw.reviewCount || 0),
    soldCount: Number(raw.sold_count || raw.soldCount || 0),
    status: raw.status || 'DRAFT',
    version: Number(raw.version || 1),
    rejection_reason: raw.rejection_reason || raw.rejected_reason || raw.reject_reason || '',
    skus: (raw.skus || []).map((sku, index) => {
      const skuPrice = Number(sku.price_override || sku.price?.sale_price || sku.price?.base_price || sku.price || salePrice);
      return {
        id: String(sku.sku_id || sku._id || sku.id || `sku-${index}`),
        skuId: String(sku.sku_id || sku._id || sku.id || `sku-${index}`),
        sku_code: sku.sku_code || sku.seller_sku || `SKU-${index}`,
        seller_sku: sku.seller_sku || sku.sku_code || `SKU-${index}`,
        name: sku.name || sku.sku_code || sku.seller_sku || `Biến thể ${index + 1}`,
        attributes: sku.attributes || {},
        price: skuPrice,
        price_override: Number(sku.price_override || skuPrice),
        originalPrice: Number(sku.price?.base_price || basePrice),
        stock: Number(sku.stock_display ?? sku.stock ?? sku.available_quantity ?? 0),
        stock_display: Number(sku.stock_display ?? sku.stock ?? sku.available_quantity ?? 0),
        barcode: sku.barcode || '',
        status: sku.status || 'ACTIVE'
      };
    }),
    attribute_definitions: raw.attribute_definitions || [],
    shop: raw.shop || raw.shop_projection || null,
    shop_id: raw.shop_id || raw.shop?.id || raw.shop_projection?.shop_id || ''
  };
};

/**
 * Chuẩn hóa danh sách sản phẩm từ các kiểu response khác nhau
 * @param {Array|Object} rawList - Mảng hoặc object chứa mảng { data: [], meta: {} }
 * @returns {Array} Mảng các sản phẩm đã chuẩn hóa
 */
export const normalizeProductList = (rawList) => {
  if (!rawList) return [];
  const list = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.data)
    ? rawList.data
    : Array.isArray(rawList?.items)
    ? rawList.items
    : [];
  return list.map(normalizeProduct);
};

/**
 * Chuẩn hóa danh mục sản phẩm từ Backend NestJS
 * @param {Object} raw - Dữ liệu danh mục thô
 * @returns {Object} Category object chuẩn hóa
 */
export const normalizeCategory = (raw = {}) => {
  if (!raw) return null;
  const bps = Number(raw.tax_rate_bps ?? raw.taxRateBps ?? 0);
  return {
    id: String(raw.category_id || raw._id || raw.id || ''),
    categoryId: String(raw.category_id || raw._id || raw.id || ''),
    name: raw.name || '',
    slug: raw.slug || '',
    parent_id: raw.parent_id || raw.parentId || null,
    parentId: raw.parent_id || raw.parentId || null,
    tax_rate_bps: bps,
    taxRateBps: bps,
    tax: bps / 10000, // 1000 bps -> 0.10 (10%)
    taxPercentage: bps / 100, // 1000 bps -> 10%
    icon_url: raw.icon_url || raw.icon || '',
    icon: raw.icon_url || raw.icon || '',
    display_order: Number(raw.display_order ?? raw.displayOrder ?? raw.sort_order ?? 0),
    displayOrder: Number(raw.display_order ?? raw.displayOrder ?? raw.sort_order ?? 0),
    status: raw.status || 'ACTIVE',
    version: Number(raw.version || 1),
    children: Array.isArray(raw.children) ? raw.children.map(normalizeCategory) : []
  };
};

export default normalizeProduct;
