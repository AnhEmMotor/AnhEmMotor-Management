/**
 * Định dạng ngày giờ theo kiểu Việt Nam
 * @param {string|Date} date - Giá trị ngày cần định dạng
 * @returns {string} Chuỗi ngày giờ (dd/mm/yyyy hh:mm)
 */
export const formatDateTime = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Định dạng ngày theo kiểu Việt Nam
 * @param {string|Date} date - Giá trị ngày cần định dạng
 * @returns {string} Chuỗi ngày (dd/mm/yyyy)
 */
export const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('vi-VN')
}
