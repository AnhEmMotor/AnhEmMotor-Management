/**
 * Chuyển đổi văn bản thành slug (URL friendly)
 * @param {string} text - Văn bản cần chuyển đổi
 * @returns {string} Slug
 */
export const slugify = (text) => {
  if (!text) return ''
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, 'd')
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu -
    .replace(/[^\w-]+/g, '') // Xóa ký tự đặc biệt
    .replace(/--+/g, '-') // Thay nhiều dấu - bằng 1 dấu -
}

/**
 * Tạo slug cho biến thể sản phẩm dựa trên tên và các tùy chọn
 * @param {string} productName - Tên sản phẩm
 * @param {Array|Object} options - Danh sách các tùy chọn hoặc đối tượng tùy chọn
 * @param {string} version - Phiên bản (tùy chọn)
 * @param {string} color - Màu sắc (tùy chọn)
 * @param {number|string} price - Giá (tùy chọn)
 * @returns {string} Slug của biến thể
 */
export const generateVariantSlug = (productName, options = [], version = '', color = '', price = '') => {
  const parts = [slugify(productName)]
  
  if (version) parts.push(slugify(version))
  if (color) parts.push(slugify(color))
  
  if (options) {
    if (Array.isArray(options)) {
      options.forEach(o => {
        const val = o.value || o.OptionValueName || ''
        if (val) parts.push(slugify(val))
      })
    } else if (typeof options === 'object') {
      Object.values(options).forEach(val => {
        if (val) parts.push(slugify(val))
      })
    }
  }
  
  // Optional: add price or ID if you want unique slugs for same variants with different prices
  // if (price) parts.push(slugify(price.toString()))
  
  return parts.filter(Boolean).join('-')
}
