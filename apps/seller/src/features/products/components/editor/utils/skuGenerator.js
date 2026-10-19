/**
 * Pure functions sinh tổ hợp Cartesian Product và mảng SKU
 */

/**
 * Sinh tổ hợp Cartesian Product từ danh sách thuộc tính hợp lệ
 * @param {Array<{ name: string, values: string[] }>} attributes 
 * @returns {Array<Record<string, string>>}
 */
export function generateCartesianCombinations(attributes = []) {
  const validAttrs = attributes.filter(a => a.values && a.values.length > 0);
  if (validAttrs.length === 0) return [];

  let combos = [{}];
  validAttrs.forEach(attr => {
    const nextCombos = [];
    combos.forEach(combo => {
      attr.values.forEach(val => {
        nextCombos.push({ ...combo, [attr.name]: val });
      });
    });
    combos = nextCombos;
  });

  return combos;
}

/**
 * Tạo mã SKU gợi ý từ tiền tố SPU và các giá trị của tổ hợp thuộc tính
 * @param {string} spuCode 
 * @param {Record<string, string>} combo 
 * @param {number} idx 
 * @returns {string}
 */
export function generateSkuCode(spuCode = 'SPU', combo = {}, idx = 0) {
  const cleanPrefix = (spuCode || 'SKU')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const cleanParts = Object.values(combo).map(val =>
    String(val)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
  ).filter(Boolean);

  if (cleanParts.length === 0) {
    return cleanPrefix ? `${cleanPrefix}-STANDARD` : `SKU-${idx + 1}`;
  }

  return [cleanPrefix || 'SKU', ...cleanParts].join('-');
}

/**
 * So sánh xem tổ hợp thuộc tính mới có thay đổi so với các SKU hiện có hay không
 * @param {Array<Record<string, string>>} combos 
 * @param {Array} existingSkus 
 * @returns {boolean}
 */
export function hasCombinationsChanged(combos = [], existingSkus = []) {
  if (combos.length === 0) {
    // Nếu không có tổ hợp, chỉ không đổi nếu existingSkus đúng 1 SKU đơn
    return !(existingSkus.length === 1 && Object.keys(existingSkus[0]?.attributes || {}).length === 0);
  }

  if (combos.length !== existingSkus.length) return true;

  // Kiểm tra từng combo xem có tìm thấy SKU cũ tương ứng không
  return combos.some(combo => {
    return !existingSkus.some(old => {
      const oldAttrs = old.attributes || {};
      const comboKeys = Object.keys(combo);
      const oldKeys = Object.keys(oldAttrs);
      if (comboKeys.length !== oldKeys.length) return false;
      return comboKeys.every(k => oldAttrs[k] === combo[k]);
    });
  });
}

/**
 * Hàm sinh danh sách SKU từ các tổ hợp thuộc tính Cartesian Product
 * @param {Array<Record<string, string>>} combos 
 * @param {Array} existingSkus 
 * @param {string} currentSpuCode 
 * @param {string} fallbackPrice
 * @param {number} fallbackStock
 * @returns {Array}
 */
export function generateSkusFromCombos(
  combos = [],
  existingSkus = [],
  currentSpuCode = 'SPU',
  fallbackPrice = '29.490.000',
  fallbackStock = 50
) {
  const basePrice = existingSkus[0]?.price || fallbackPrice;
  const baseStock = existingSkus[0]?.stock ?? fallbackStock;

  if (!combos || combos.length === 0) {
    // Trường hợp sản phẩm đơn không có biến thể
    const existingSingle = existingSkus.find(s => Object.keys(s.attributes || {}).length === 0);
    return [
      {
        id: existingSingle?.id || 'sku-single',
        code: existingSingle?.code || `${(currentSpuCode || 'SKU').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-DEFAULT`,
        name: 'Tiêu chuẩn',
        price: existingSingle?.price || basePrice,
        stock: existingSingle?.stock ?? baseStock,
        enabled: existingSingle?.enabled ?? true,
        attributes: {}
      }
    ];
  }

  return combos.map((combo, idx) => {
    // Tìm SKU cũ khớp chính xác tổ hợp thuộc tính
    const matchOld = existingSkus.find(old => {
      const oldAttrs = old.attributes || {};
      const comboKeys = Object.keys(combo);
      const oldKeys = Object.keys(oldAttrs);
      if (comboKeys.length !== oldKeys.length) return false;
      return comboKeys.every(k => oldAttrs[k] === combo[k]);
    });

    if (matchOld) {
      return {
        ...matchOld,
        // Nếu SKU cũ chưa có code hoặc rỗng thì gợi ý code
        code: matchOld.code || generateSkuCode(currentSpuCode, combo, idx)
      };
    }

    // Tạo SKU mới từ tổ hợp
    const code = generateSkuCode(currentSpuCode, combo, idx);
    const name = Object.values(combo).join(' / ');

    return {
      id: `sku-gen-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      name,
      price: basePrice,
      stock: baseStock,
      enabled: true,
      attributes: { ...combo }
    };
  });
}

