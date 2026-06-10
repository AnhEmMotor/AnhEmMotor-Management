import request from '@/utils/http'
import type { Banner, BannerList } from '@/domain/marketing/banner.types'

export const BannerApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<BannerList>({
      url: '/api/v1/banners',
      params: {
        Page: current || 1,
        PageSize: size || 10,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<Banner>({
      url: `/api/v1/banners/${id}`
    })
  },

  create(data: Partial<Banner>) {
    return request.post<number>({
      url: '/api/v1/banners',
      data
    })
  },

  update(id: number, data: Partial<Banner>) {
    return request.put<void>({
      url: `/api/v1/banners/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del<void>({
      url: `/api/v1/banners/${id}`
    })
  },

  changeStatus(id: number, status: boolean) {
    return request.patch<void>({
      url: `/api/v1/banners/${id}/status`,
      data: { isActive: status }
    })
  }
}
