/**
 * Tiện ích chuẩn hóa và hiển thị số điện thoại Việt Nam
 */

/**
 * Chuyển số điện thoại sang định dạng hiển thị với số 0 đầu tiên (VD: 0909123456 thay vì +84909123456)
 * @param {string} phone Số điện thoại từ API hoặc người dùng
 * @returns {string} Số điện thoại có số 0 ở đầu
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  if (trimmed.startsWith('+84')) {
    return '0' + trimmed.slice(3).trim();
  }
  if (trimmed.startsWith('84') && trimmed.replace(/\D/g, '').length >= 10) {
    return '0' + trimmed.slice(2).trim();
  }
  return trimmed;
};

/**
 * Chuyển số điện thoại sang chuẩn E.164 (+84...) để gửi lên Backend
 * @param {string} phone Số điện thoại người dùng nhập
 * @returns {string} Số điện thoại bắt đầu bằng +84
 */
export const toBackendPhone = (phone) => {
  if (!phone) return '';
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.startsWith('0')) {
    return '+84' + clean.slice(1);
  }
  if (clean.startsWith('84')) {
    return '+' + clean;
  }
  if (clean.startsWith('+84')) {
    return clean;
  }
  return clean;
};

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ (hỗ trợ cả 0, 84, +84)
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidVietnamesePhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).replace(/\s+/g, '');
  const phoneRegex = /^(0|84|\+84)[35789][0-9]{8}$/;
  return phoneRegex.test(clean);
};
