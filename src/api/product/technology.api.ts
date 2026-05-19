import request from '@/utils/http'
import type { Technology } from '@/domain/product/technology.types'

export const TechnologyApi = {
  getList: (params?: { category_id?: number; brand_id?: number }) => {
    return request.get<Technology[]>({
      url: '/api/Technologies',
      params
    })
  },

  getCategories: () => {
    return request.get<any[]>({
      url: '/api/Technologies/categories'
    })
  }
}
