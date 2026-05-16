import request from '@/utils/http'

/**
 * Infrastructure Layer - Vehicle Type API
 */
export const VehicleTypeApi = {
  /**
   * Get list of vehicle types
   */
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

  /**
   * Get vehicle type by ID
   */
  getById(id: number) {
    return request.get<any>({
      url: `/api/VehicleType/${id}`
    })
  },

  /**
   * Create new vehicle type
   */
  create(data: any) {
    return request.post<any>({
      url: '/api/VehicleType',
      data
    })
  },

  /**
   * Update vehicle type
   */
  update(id: number, data: any) {
    return request.put<any>({
      url: `/api/VehicleType/${id}`,
      data
    })
  },

  /**
   * Delete vehicle type
   */
  delete(id: number) {
    return request.del({
      url: `/api/VehicleType/${id}`
    })
  }
}
