/**
 * Xử lý URL ảnh, hỗ trợ ảnh local và ảnh từ server
 * @param {string} path - Đường dẫn ảnh
 * @returns {string} URL hoàn chỉnh
 */
export const getImageUrl = (path) => {
  if (!path) return '/image-placeholder.svg'
  if (path.startsWith('http')) return path
  
  // Lấy base URL từ env hoặc mặc định localhost:5000
  const baseURL = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'
  
  // Đảm bảo không có dấu // dư thừa
  const cleanPath = path.replace(/^\//, '')
  return `${baseURL}/${cleanPath}`
}
