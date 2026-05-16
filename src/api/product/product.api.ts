import request from '@/utils/http'
import type { Product, ProductList } from '@/domain/product/product.types'

export const ProductApi = {
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

  getById(id: number) {
    return request.get<Product>({
      url: `/api/Product/${id}/for-manager`
    })
  },

  create(data: Partial<Product>) {
    return request.post<Product>({
      url: '/api/Product',
      data
    })
  },

  update(id: number, data: Partial<Product>) {
    return request.put<Product>({
      url: `/api/Product/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/Product/${id}`
    })
  }
}
