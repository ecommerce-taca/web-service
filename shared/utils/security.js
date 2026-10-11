/**
 * Tiện ích bảo mật cho Taca Ecommerce
 * Phòng chống CSV / Excel Formula Injection (CWE-1236)
 */

/**
 * Làm sạch một giá trị ô bảng tính trước khi xuất file.
 * Nếu chuỗi bắt đầu bằng các ký tự công thức (=, +, -, @, \t, \r)
 * thì thêm dấu nháy đơn (') phía trước để trình đọc bảng tính (Excel/Calc)
 * hiểu là chuỗi văn bản thuần túy, ngăn ngừa thực thi lệnh nguy hiểm.
 *
 * @param {any} value
 * @returns {any}
 */
export const sanitizeExcelCell = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  const str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

/**
 * Làm sạch toàn bộ các thuộc tính chuỗi trong một object (ví dụ bản ghi SPU/SKU)
 * @param {Object} obj
 * @returns {Object}
 */
export const sanitizeObjectForExport = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      sanitized[key] = sanitizeExcelCell(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      sanitized[key] = sanitizeObjectForExport(val);
    } else if (Array.isArray(val)) {
      sanitized[key] = val.map((item) =>
        typeof item === 'object' ? sanitizeObjectForExport(item) : sanitizeExcelCell(item)
      );
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
};
