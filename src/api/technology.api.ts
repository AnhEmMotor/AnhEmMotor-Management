import request from '@/utils/http'
import type { Technology } from '@/domain/product/technology.types'

export const TechnologyApi = {
  getList: (params?: { category_id?: number; brand_id?: number }) => {
    return request.get<Technology[]>({
      url: '/api/v1/Technologies',
      params
    })
  },

  getCategories: () => {
    return request.get<any[]>({
      url: '/api/v1/Technologies/categories'
    })
  },

  create: (data: {
    name: string
    categoryId?: number
    brandId?: number
    defaultTitle?: string
    defaultDescription?: string
    defaultImageUrl?: string
  }) => {
    return request.post<Technology>({
      url: '/api/v1/Technologies',
      data
    })
  },

  createCategory: (data: { name: string }) => {
    return request.post<any>({
      url: '/api/v1/Technologies/categories',
      data
    })
  },

  update: (
    id: number,
    data: {
      id: number
      name: string
      categoryId?: number
      brandId?: number
      defaultTitle?: string
      defaultDescription?: string
      defaultImageUrl?: string
    }
  ) => {
    return request.put<Technology>({
      url: `/api/v1/Technologies/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request.del({
      url: `/api/v1/Technologies/${id}`
    })
  }
}
