import request from '@/utils/http'
import type {
  QuotationDetailResponse,
  QuotationListResponse,
  CreateQuotationCommand,
  UpdateQuotationCommand
} from '@/domain/inventory/quotation.types'

export const QuotationApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<QuotationListResponse>({
      url: '/api/v1/Quotations',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<QuotationDetailResponse>({
      url: `/api/v1/Quotations/${id}`
    })
  },

  create(data: CreateQuotationCommand) {
    return request.post<QuotationDetailResponse>({
      url: '/api/v1/Quotations',
      data
    })
  },

  update(id: number, data: UpdateQuotationCommand) {
    return request.put<QuotationDetailResponse>({
      url: `/api/v1/Quotations/${id}`,
      data
    })
  },

  send(id: number) {
    return request.patch<QuotationDetailResponse>({
      url: `/api/v1/Quotations/${id}/send`
    })
  },

  approveReject(id: number, status: string) {
    return request.patch<void>({
      url: `/api/v1/Quotations/${id}/status`,
      data: { status }
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/Quotations/${id}`
    })
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: '/api/v1/Quotations/status'
    })
  }
}
