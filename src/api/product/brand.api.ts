import request from '@/utils/http'
import type { Brand, BrandList } from '@/domain/product/brand.types'

export const BrandApi = {
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

  getById(id: number) {
    return request.get<Brand>({
      url: `/api/Brand/${id}`
    })
  },

  create(data: Partial<Brand>) {
    return request.post<Brand>({
      url: '/api/Brand',
      data
    })
  },

  update(id: number, data: Partial<Brand>) {
    return request.put<Brand>({
      url: `/api/Brand/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/Brand/${id}`
    })
  }
}
