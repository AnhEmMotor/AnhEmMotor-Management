import request from '@/utils/http'

export const VehicleTypeApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<any>({
      url: '/api/VehicleType',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<any>({
      url: `/api/VehicleType/${id}`
    })
  },

  create(data: any) {
    return request.post<any>({
      url: '/api/VehicleType',
      data
    })
  },

  update(id: number, data: any) {
    return request.put<any>({
      url: `/api/VehicleType/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/VehicleType/${id}`
    })
  }
}
