import request from '@/utils/http'
import type {
  CreateSalesOrderByManager,
  SalesOrder,
  SalesOrderList,
  UpdateSalesOrderForManager,
} from '@/domain/order/order.types'

export const SalesOrderApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<SalesOrderList>({
      url: '/api/SalesOrders',
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    })
  },

  getById(id: number) {
    return request.get<SalesOrder>({
      url: `/api/SalesOrders/${id}`,
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/SalesOrders/status',
    })
  },

  getStatusMap() {
    return request.get<Array<{ id: string; name: string }>>({
      url: '/api/SalesOrders/status-map',
    })
  },

  getTransitionMap() {
    return request.get<Record<string, string[]>>({
      url: '/api/SalesOrders/transition-map',
    })
  },

  getLockedStatuses() {
    return request.get({
      url: '/api/SalesOrders/locked-statuses',
    })
  },

  createByManager(data: CreateSalesOrderByManager) {
    return request.post<SalesOrder>({
      url: '/api/SalesOrders/by-manager',
      data,
    })
  },

  updateForManager(id: number, data: UpdateSalesOrderForManager) {
    return request.put<SalesOrder>({
      url: `/api/SalesOrders/for-manager/${id}`,
      data,
    })
  },

  updateStatus(id: number, statusId: string, selectedVehicleIds?: number[]) {
    return request.patch<SalesOrder>({
      url: `/api/SalesOrders/${id}/status`,
      data: { statusId, selectedVehicleIds },
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/SalesOrders/${id}`,
    })
  },
}
