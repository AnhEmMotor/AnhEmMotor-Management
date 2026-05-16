import request from '@/utils/http'

/**
 * Infrastructure Layer - File API
 */
export const FileApi = {
  /**
   * Upload product image
   * @param file File object
   */
  uploadProductImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<any>({
      url: '/api/MediaFile/product/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Upload news image
   */
  uploadNewsImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<any>({
      url: '/api/MediaFile/news/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
