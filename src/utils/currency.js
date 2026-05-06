/**
 * Định dạng số thành tiền tệ Việt Nam (VND)
 * @param {number|string} value - Giá trị cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0 ₫'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num)
}

/**
 * Chuyển đổi chuỗi tiền tệ ngược lại thành số
 * @param {string} str - Chuỗi tiền tệ
 * @returns {number} Số nguyên/thực
 */
export const parseCurrency = (str) => {
  if (!str) return 0
  if (typeof str === 'number') return str
  // Remove thousand separators (.) and currency symbols/spaces
  // But keep the decimal comma if any (convert to dot for Number())
  const sanitized = str.toString()
    .replace(/\./g, '') // Remove thousand dots
    .replace(/,/g, '.') // Convert decimal comma to dot
    .replace(/[^0-9.-]+/g, '') // Remove everything else except digits, dot, and minus
  const num = parseFloat(sanitized)
  return isNaN(num) ? 0 : num
}
