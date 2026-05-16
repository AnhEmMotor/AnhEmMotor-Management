import request from '@/utils/http'
import type { ProductCategory, ProductCategoryList } from '@/domain/product/category.types'

/**
 * Infrastructure Layer - Product Category API
 */
export const CategoryApi = {
  /**
   * Get list of categories
   */
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<ProductCategoryList>({
      url: '/api/ProductCategory',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  /**
   * Get category by ID
   */
  getById(id: number) {
    return request.get<ProductCategory>({
      url: `/api/ProductCategory/${id}`
    })
  },

  /**
   * Create new category
   */
  create(data: Partial<ProductCategory>) {
    return request.post<ProductCategory>({
      url: '/api/ProductCategory',
      data
    })
  },

  /**
   * Update category
   */
  update(id: number, data: Partial<ProductCategory>) {
    return request.put<ProductCategory>({
      url: `/api/ProductCategory/${id}`,
      data
    })
  },

  /**
   * Delete category
   */
  delete(id: number) {
    return request.del({
      url: `/api/ProductCategory/${id}`
    })
  }
}
