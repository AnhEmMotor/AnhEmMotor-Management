import request from '@/utils/http'
import type {
  InventoryReceipt,
  InventoryReceiptList,
  CreateInventoryReceipt,
  UpdateInventoryReceipt
} from '@/domain/inventory/receipt.types'
import { PurchaseRequestList } from '@/domain/purchase-request/request.types'

export const InventoryReceiptApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<InventoryReceiptList>({
      url: '/api/v1/InventoryReceipts',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getListPurchaseRequestOrdered(params: any) {
    const { current, size, ...rest } = params
    return request.get<PurchaseRequestList>({
      url: '/api/v1/purchase-requests/approved',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<InventoryReceipt>({
      url: `/api/v1/InventoryReceipts/${id}`
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/v1/InventoryReceipts/status'
    })
  },

  getStats() {
    return request.get<{ totalVehicles: number; processingReceipts: number; totalValue: number }>({
      url: '/api/v1/InventoryReceipts/statistics'
    })
  },

  create(data: CreateInventoryReceipt) {
    return request.post<InventoryReceipt>({
      url: '/api/v1/InventoryReceipts',
      data
    })
  },

  update(id: number, data: UpdateInventoryReceipt) {
    return request.put<InventoryReceipt>({
      url: `/api/v1/InventoryReceipts/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/InventoryReceipts/${id}`
    })
  },

  updateStatus(id: number, statusId: string) {
    return request.patch<InventoryReceipt>({
      url: `/api/v1/InventoryReceipts/${id}/status`,
      data: { statusId }
    })
  },

  updateNotes(id: number, notes: string | null) {
    return request.patch<InventoryReceipt>({
      url: `/api/v1/InventoryReceipts/${id}/notes`,
      data: { notes }
    })
  }
}
