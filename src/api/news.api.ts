import request from '@/utils/http'

export const NewsApi = {
  getList(params: any) {
    const { current, size, Filters, Sorts, ...rest } = params
    return request.get<any>({
      url: '/api/v1/news',
      params: {
        Page: current,
        PageSize: size,
        Filters,
        Sorts,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<any>({
      url: `/api/v1/news/${id}`
    })
  },

  getBySlug(slug: string) {
    return request.get<any>({
      url: `/api/v1/news/${slug}`
    })
  },

  create(data: any) {
    return request.post<any>({
      url: '/api/v1/news',
      data
    })
  },

  update(id: number, data: any) {
    return request.put<any>({
      url: `/api/v1/news/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/news/${id}`
    })
  },

  updateStatus(id: number, data: any) {
    return request.patch<any>({
      url: `/api/v1/news/${id}/status`,
      data
    })
  },

  getProductsForSelection() {
    return request.get<any>({
      url: '/api/v1/news/products-for-selection'
    })
  },

  uploadCoverImage(data: FormData) {
    return request.post<any>({
      url: '/api/v1/news/images/cover',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
