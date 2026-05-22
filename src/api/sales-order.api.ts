import request from '@/utils/http'
import type {
  CreateSalesOrderByManager,
  SalesOrder,
  SalesOrderList,
  UpdateSalesOrderForManager,
  VehicleAssignmentRequirement
} from '@/domain/order/order.types'

export const SalesOrderApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<SalesOrderList>({
      url: '/api/SalesOrders',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<SalesOrder>({
      url: `/api/SalesOrders/${id}`
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/SalesOrders/status'
    })
  },

  getStatusMap() {
    return request.get<Array<{ id: string; name: string }>>({
      url: '/api/SalesOrders/status-map'
    })
  },

  getTransitionMap() {
    return request.get<Record<string, string[]>>({
      url: '/api/SalesOrders/transition-map'
    })
  },

  getLockedStatuses() {
    return request.get({
      url: '/api/SalesOrders/locked-statuses'
    })
  },

  getVehicleAssignmentStatuses() {
    return request.get<string[]>({
      url: '/api/SalesOrders/vehicle-assignment-statuses'
    })
  },

  getVehicleAssignmentRequirements(id: number, targetStatusId: string) {
    return request.get<VehicleAssignmentRequirement>({
      url: `/api/SalesOrders/${id}/vehicle-assignment-requirements`,
      params: { targetStatusId }
    })
  },

  createByManager(data: CreateSalesOrderByManager) {
    return request.post<SalesOrder>({
      url: '/api/SalesOrders/by-manager',
      data
    })
  },

  updateForManager(id: number, data: UpdateSalesOrderForManager) {
    return request.put<SalesOrder>({
      url: `/api/SalesOrders/for-manager/${id}`,
      data
    })
  },

  updateStatus(id: number, statusId: string, selectedVehicleIds?: number[]) {
    return request.patch<SalesOrder>({
      url: `/api/SalesOrders/${id}/status`,
      data: { statusId, selectedVehicleIds }
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/SalesOrders/${id}`
    })
  }
}
