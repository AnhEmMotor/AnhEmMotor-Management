import request from '@/utils/http'
import type {
  InventoryReceipt,
  InventoryReceiptList,
  CreateInventoryReceipt,
  UpdateInventoryReceipt
} from '@/domain/inventory/receipt.types'

export const InventoryReceiptApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<InventoryReceiptList>({
      url: '/api/InventoryReceipts',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<InventoryReceipt>({
      url: `/api/InventoryReceipts/${id}`
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/InventoryReceipts/status'
    })
  },

  getStats() {
    return request.get<{ totalVehicles: number; processingReceipts: number; totalValue: number }>({
      url: '/api/InventoryReceipts/statistics'
    })
  },

  create(data: CreateInventoryReceipt) {
    return request.post<InventoryReceipt>({
      url: '/api/InventoryReceipts',
      data
    })
  },

  update(id: number, data: UpdateInventoryReceipt) {
    return request.put<InventoryReceipt>({
      url: `/api/InventoryReceipts/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/InventoryReceipts/${id}`
    })
  },

  updateStatus(id: number, statusId: string) {
    return request.patch<InventoryReceipt>({
      url: `/api/InventoryReceipts/${id}/status`,
      data: { statusId }
    })
  },

  updateNotes(id: number, notes: string | null) {
    return request.patch<InventoryReceipt>({
      url: `/api/InventoryReceipts/${id}/notes`,
      data: { notes }
    })
  }
}
