import request from '@/utils/http'
import type {
  Product,
  ProductList,
  ProductVariantLiteForInputList
} from '@/domain/product/product.types'

export const ProductApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<ProductList>({
      url: '/api/v1/Product/for-manager',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  exportProducts(params: any) {
    return request.get({
      url: '/api/v1/Product/export',
      params,
      responseType: 'blob' as const
    })
  },

  getById(id: number) {
    return request.get<Product>({
      url: `/api/v1/Product/${id}/for-manager`
    })
  },

  create(data: Partial<Product>) {
    return request.post<Product>({
      url: '/api/v1/Product',
      data
    })
  },

  update(id: number, data: Partial<Product>) {
    return request.put<Product>({
      url: `/api/v1/Product/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/Product/${id}`
    })
  },

  getVariantsForInput(params: any) {
    const { current, size, ...rest } = params
    return request.get<ProductVariantLiteForInputList>({
      url: '/api/v1/Product/variants-lite/for-InventoryReceipt',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getVariantsForOutput(params: any) {
    const { current, size, ...rest } = params
    return request.get<ProductVariantLiteForInputList>({
      url: '/api/v1/Product/variants-lite/for-output',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getPredefinedOptions() {
    return request.get<Record<string, string>>({
      url: '/api/v1/Option/predefined'
    })
  }
}
