export const formatVietnameseNumber = (value, fractionDigits = 0) =>
  value.toLocaleString('vi-VN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export const formatVnd = (value) => `${value.toLocaleString('vi-VN')}₫`;
