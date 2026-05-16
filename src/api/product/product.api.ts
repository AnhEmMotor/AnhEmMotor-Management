import request from '@/utils/http'
import type { Product, ProductList } from '@/domain/product/product.types'

/**
 * Infrastructure Layer - Product API
 */
export const ProductApi = {
  /**
   * Get list of products (manager view)
   */
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<ProductList>({
      url: '/api/Product/for-manager',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  /**
   * Get product by ID
   */
  getById(id: number) {
    return request.get<Product>({
      url: `/api/Product/${id}/for-manager`
    })
  },

  /**
   * Create new product
   */
  create(data: Partial<Product>) {
    return request.post<Product>({
      url: '/api/Product',
      data
    })
  },

  /**
   * Update product
   */
  update(id: number, data: Partial<Product>) {
    return request.put<Product>({
      url: `/api/Product/${id}`,
      data
    })
  },

  /**
   * Delete product
   */
  delete(id: number) {
    return request.del({
      url: `/api/Product/${id}`
    })
  }
}
