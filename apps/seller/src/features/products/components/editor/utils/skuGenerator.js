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
 * Hàm sinh danh sách SKU từ các tổ hợp thuộc tính Cartesian Product
 * @param {Array<Record<string, string>>} combos 
 * @param {Array} existingSkus 
 * @param {string} currentSpuCode 
 * @returns {Array}
 */
export function generateSkusFromCombos(combos = [], existingSkus = [], currentSpuCode = 'SPU') {
  if (!combos || combos.length === 0) {
    return [
      {
        id: 'sku-default',
        code: `${currentSpuCode || 'SPU'}-DEFAULT`,
        name: 'Tiêu chuẩn',
        price: '29.490.000',
        stock: 50,
        enabled: true,
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
      return matchOld;
    }

    // Tạo mã SKU gợi ý từ spuCode + combo values
    const cleanParts = Object.values(combo).map(val =>
      String(val)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
    ).filter(Boolean);

    const prefix = (currentSpuCode || 'SKU').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const code = [prefix, ...cleanParts].join('-') || `SKU-${idx + 1}`;
    const name = Object.values(combo).join(' / ');
    const defaultPrice = existingSkus[0]?.price || '29.490.000';
    const defaultStock = existingSkus[0]?.stock ?? 20;

    return {
      id: `sku-gen-${idx + 1}-${Date.now().toString(36)}`,
      code,
      name,
      price: defaultPrice,
      stock: defaultStock,
      enabled: true,
      attributes: { ...combo }
    };
  });
}
