import request from '@/utils/http'

export const FileApi = {
  uploadProductImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<any>({
      url: '/api/MediaFile/product/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadNewsImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<any>({
      url: '/api/MediaFile/news/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
