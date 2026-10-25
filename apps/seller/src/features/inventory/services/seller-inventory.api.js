import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY_SELLER_INVENTORY = 'taca_seller_inventory_data';

const DEFAULT_MOCK_INVENTORY = [
  {
    sku_id: 'sku-ip16pm-256-nat',
    product_id: 'spu-ip16pm',
    seller_sku: 'IP16PM-256-NAT',
    product_name: 'iPhone 16 Pro Max',
    sku_label: '256GB / Titan Tự Nhiên',
    available_qty: 42,
    reserved_qty: 5,
    status: 'ACTIVE',
    low_stock: false,
    version: 12,
    updated_at: '2026-08-30T09:00:00Z',
  },
  {
    sku_id: 'sku-ip16pm-512-blk',
    product_id: 'spu-ip16pm',
    seller_sku: 'IP16PM-512-BLK',
    product_name: 'iPhone 16 Pro Max',
    sku_label: '512GB / Titan Đen',
    available_qty: 6,
    reserved_qty: 2,
    status: 'ACTIVE',
    low_stock: true,
    version: 8,
    updated_at: '2026-08-30T10:15:00Z',
  },
  {
    sku_id: 'sku-ip16pm-1tb-nat',
    product_id: 'spu-ip16pm',
    seller_sku: 'IP16PM-1TB-NAT',
    product_name: 'iPhone 16 Pro Max',
    sku_label: '1TB / Titan Tự Nhiên',
    available_qty: 0,
    reserved_qty: 0,
    status: 'ACTIVE',
    low_stock: true,
    version: 4,
    updated_at: '2026-08-29T16:20:00Z',
  },
  {
    sku_id: 'sku-ipad-m2-128-wf',
    product_id: 'spu-ipad-air-m2',
    seller_sku: 'IPAD-M2-128-WF',
    product_name: 'iPad Air M2 11 inch',
    sku_label: '128GB / Wi-Fi / Blue',
    available_qty: 18,
    reserved_qty: 3,
    status: 'ACTIVE',
    low_stock: false,
    version: 6,
    updated_at: '2026-08-30T08:00:00Z',
  },
  {
    sku_id: 'sku-sony-xm5-blk',
    product_id: 'spu-sony-xm5',
    seller_sku: 'SONY-XM5-BLK',
    product_name: 'Tai nghe Sony WH-1000XM5',
    sku_label: 'Đen nhám / Chống ồn chủ động',
    available_qty: 24,
    reserved_qty: 4,
    status: 'ACTIVE',
    low_stock: false,
    version: 9,
    updated_at: '2026-08-30T11:45:00Z',
  },
  {
    sku_id: 'sku-anker-65w-blk',
    product_id: 'spu-anker-65w',
    seller_sku: 'ANKER-65W-GAN',
    product_name: 'Củ sạc Anker GaNPrime 65W',
    sku_label: 'Đen / 3 cổng (2C1A)',
    available_qty: 4,
    reserved_qty: 1,
    status: 'ACTIVE',
    low_stock: true,
    version: 15,
    updated_at: '2026-08-30T07:30:00Z',
  },
];

const getStoredMockInventory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELLER_INVENTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Lỗi đọc mock inventory từ localStorage:', err);
  }
  return DEFAULT_MOCK_INVENTORY;
};

const saveStoredMockInventory = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY_SELLER_INVENTORY, JSON.stringify(items));
  } catch (err) {
    console.warn('Lỗi ghi mock inventory vào localStorage:', err);
  }
};

/**
 * Lấy danh sách tồn kho cho Seller (MISS-004)
 * @param {Object} params - { sku_id, product_id, status, page, size, search }
 */
export const getSellerInventory = async (params = {}) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.get('/seller/inventory', { params });
      return res?.data || res;
    } catch (err) {
      console.warn('Không thể kết nối API /seller/inventory, chuyển sang mock fallback:', err);
    }
  }

  await new Promise((r) => setTimeout(r, 200));
  let items = getStoredMockInventory();
  const { sku_id, product_id, status, search, low_stock } = params;

  if (sku_id) {
    items = items.filter((i) => i.sku_id === sku_id);
  }

  if (product_id) {
    items = items.filter((i) => i.product_id === product_id);
  }

  if (status && status !== 'all') {
    items = items.filter((i) => i.status === status);
  }

  if (low_stock === true || low_stock === 'true') {
    items = items.filter((i) => i.low_stock);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.sku_id.toLowerCase().includes(q) ||
        (i.seller_sku && i.seller_sku.toLowerCase().includes(q)) ||
        (i.product_name && i.product_name.toLowerCase().includes(q)) ||
        (i.sku_label && i.sku_label.toLowerCase().includes(q))
    );
  }

  const page = Number(params.page) || 1;
  const size = Number(params.size) || 20;
  const total = items.length;
  const start = (page - 1) * size;
  const pagedItems = items.slice(start, start + size);

  // Tính metrics tổng hợp
  const allStored = getStoredMockInventory();
  const totalAvailable = allStored.reduce((sum, item) => sum + (item.available_qty || 0), 0);
  const totalReserved = allStored.reduce((sum, item) => sum + (item.reserved_qty || 0), 0);
  const lowStockCount = allStored.filter((item) => item.low_stock || item.available_qty <= 5).length;

  return {
    data: pagedItems,
    metrics: {
      total_skus: allStored.length,
      total_available: totalAvailable,
      total_reserved: totalReserved,
      low_stock_count: lowStockCount,
    },
    meta: {
      page,
      size,
      total,
      total_pages: Math.ceil(total / size) || 1,
    },
  };
};

/**
 * Điều chỉnh tồn kho thực tế của SKU bằng delta (MISS-004)
 * @param {string} skuId
 * @param {Object} payload - { delta_available, reason, version }
 */
export const adjustSellerInventory = async (skuId, { delta_available = 0, reason = 'Nhập thêm hàng', version = 1 } = {}) => {
  if (!isMockMode()) {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const res = await apiClient.patch(
        `/seller/inventory/${skuId}/adjust`,
        { delta_available, reason, version },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return res?.data || res;
    } catch (err) {
      console.warn(`Lỗi khi gọi PATCH /seller/inventory/${skuId}/adjust:`, err);
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  const items = getStoredMockInventory();
  const target = items.find((i) => i.sku_id === skuId || i.seller_sku === skuId);

  if (!target) {
    throw new Error(`Không tìm thấy SKU ${skuId}`);
  }

  const newAvailable = target.available_qty + delta_available;
  if (newAvailable < 0) {
    const error = new Error('Số lượng tồn khả dụng không thể nhỏ hơn 0.');
    error.response = { data: { error: { code: 'INVENTORY_STOCK_INSUFFICIENT', message: 'Tồn kho không đủ để xuất lượng yêu cầu.' } } };
    throw error;
  }

  const newVersion = (target.version || 1) + 1;
  const updatedItems = items.map((i) => {
    if (i.sku_id === target.sku_id) {
      return {
        ...i,
        available_qty: newAvailable,
        low_stock: newAvailable <= 5,
        version: newVersion,
        updated_at: new Date().toISOString(),
      };
    }
    return i;
  });

  saveStoredMockInventory(updatedItems);
  return {
    sku_id: target.sku_id,
    available_qty: newAvailable,
    reserved_qty: target.reserved_qty,
    version: newVersion,
  };
};
