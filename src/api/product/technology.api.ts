import request from '@/utils/http'
import type { Technology } from '@/domain/product/technology.types'

/**
 * Technology API Service
 */
export const TechnologyApi = {
  /**
   * Get all technologies with optional filtering
   */
  getList: (params?: { category_id?: number; brand_id?: number }) => {
    return request.get<Technology[]>({
      url: '/api/v1/Technologies',
      params
    })
  },

  /**
   * Get all technology categories
   */
  getCategories: () => {
    return request.get<any[]>({
      url: '/api/v1/Technologies/categories'
    })
  }
}
