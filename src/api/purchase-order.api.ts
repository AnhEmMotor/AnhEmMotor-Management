import request from '@/utils/http'
import type {
  PurchaseOrderDetailResponse,
  PurchaseOrderList,
  CreatePurchaseOrder,
  UpdatePurchaseOrder
} from '@/domain/purchase-order/order.types'

export const PurchaseOrderApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<PurchaseOrderList>({
      url: '/api/v1/purchase-orders',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<PurchaseOrderDetailResponse>({
      url: `/api/v1/purchase-orders/${id}`
    })
  },

  create(data: CreatePurchaseOrder) {
    return request.post<PurchaseOrderDetailResponse>({
      url: '/api/v1/purchase-orders',
      data
    })
  },

  update(id: number, data: Omit<UpdatePurchaseOrder, 'id'>) {
    return request.put<PurchaseOrderDetailResponse>({
      url: `/api/v1/purchase-orders/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/purchase-orders/${id}`
    })
  },

  send(id: number) {
    return request.post<void>({
      url: `/api/v1/purchase-orders/${id}/send`
    })
  },

  approveReject(id: number, status: string) {
    return request.patch<void>({
      url: `/api/v1/purchase-orders/${id}/status`,
      data: { status }
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/v1/purchase-orders/status'
    })
  }
}
