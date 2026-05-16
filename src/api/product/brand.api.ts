import request from '@/utils/http'
import type { Brand, BrandList } from '@/domain/product/brand.types'

/**
 * Infrastructure Layer - Brand API
 */
export const BrandApi = {
  /**
   * Fetch brand list with pagination and filters
   */
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<BrandList>({
      url: '/api/Brand',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  /**
   * Get brand by ID
   */
  getById(id: number) {
    return request.get<Brand>({
      url: `/api/Brand/${id}`
    })
  },

  /**
   * Create new brand
   */
  create(data: Partial<Brand>) {
    return request.post<Brand>({
      url: '/api/Brand',
      data
    })
  },

  /**
   * Update brand
   */
  update(id: number, data: Partial<Brand>) {
    return request.put<Brand>({
      url: `/api/Brand/${id}`,
      data
    })
  },

  /**
   * Delete brand
   */
  delete(id: number) {
    return request.del({
      url: `/api/Brand/${id}`
    })
  }
}
