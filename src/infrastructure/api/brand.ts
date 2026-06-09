import request from '@/utils/http'

export interface Brand {
  id: number
  name: string
  origin: string
  logoUrl: string
  description: string
}

export interface BrandList {
  items: Brand[]
  totalCount: number
}

export function fetchGetBrandList(params: any) {
  const { current, size, ...rest } = params
  return request.get<BrandList>({
    url: '/api/Brand',
    params: {
      Page: current,
      PageSize: size,
      ...rest,
    },
  })
}

export function fetchGetBrandDetail(id: number) {
  return request.get<Brand>({
    url: `/api/Brand/${id}`,
  })
}
