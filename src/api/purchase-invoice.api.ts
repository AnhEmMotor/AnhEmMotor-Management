import request from '@/utils/http'
import type {
  PurchaseInvoice,
  PurchaseInvoiceList,
  CreatePurchaseInvoice,
  UpdatePurchaseInvoice
} from '@/domain/inventory/purchase-invoice.types'

export const PurchaseInvoiceApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<PurchaseInvoiceList>({
      url: '/api/v1/purchase-invoices',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<PurchaseInvoice>({
      url: `/api/v1/purchase-invoices/${id}`
    })
  },

  create(data: CreatePurchaseInvoice) {
    return request.post<PurchaseInvoice>({
      url: '/api/v1/purchase-invoices',
      data
    })
  },

  update(id: number, data: Omit<UpdatePurchaseInvoice, 'id'>) {
    return request.put<PurchaseInvoice>({
      url: `/api/v1/purchase-invoices/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/purchase-invoices/${id}`
    })
  },

  approveReject(id: number, isApproved: boolean, note?: string) {
    return request.patch<PurchaseInvoice>({
      url: `/api/v1/purchase-invoices/${id}/status`,
      data: { isApproved, note }
    })
  }
}
