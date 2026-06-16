import request from '@/utils/http'
import type { PagedResult } from '@/types/api'

export type SupplierContractStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Active'
  | 'Expired'
  | 'Terminated'
  | 'Completed'

export interface SupplierContractItemDto {
  productVariantId: number
  wholesalePrice: number
}

export interface SupplierContractSkuItem {
  id?: string
  skuCode?: string
  productName?: string
  category?: string
  wholesalePrice: number
  moq?: number
}

export interface SupplierContractAuditLogDto {
  id: string
  supplierContractId: string
  action: string
  details?: string
  changedBy?: string
  ipAddress?: string
  oldValue?: string
  newValue?: string
  createdAt?: string
}

export interface SupplierContractDto {
  id: string
  supplierId?: string
  supplierName?: string
  supplierCode?: string
  contractNumber: string
  contractFilePath?: string
  effectiveDate: string
  expirationDate?: string
  contractValue: number
  status: SupplierContractStatus
  terms?: string
  note?: string

  creditLimit?: number
  paymentWindowDays?: number
  bankAccountNumber?: string
  bankName?: string
  minimumVolumePerMonth?: number
  discountRate?: number
  parentContractId?: string

  createdAt?: string
  updatedAt?: string
  deletedAt?: string

  supplierContactName?: string
  supplierPhone?: string
  supplierEmail?: string
  supplierAddress?: string
  skuPriceList?: SupplierContractSkuItem[]
  auditLogs?: SupplierContractAuditLogDto[]
}

export interface SupplierContractListParams {
  current: number
  size: number
  Filters?: string
  Sorts?: string
  name?: string
  contractNumber?: string
  status?: string[]
  supplierId?: string
}

export interface SupplierContractStatisticsResponse {
  totalContracts: number
  activeContracts: number
  pendingApproval: number
  expiredContracts: number
  expiringContracts: number
}

export const SupplierContractApi = {
  getList(params: SupplierContractListParams) {
    const { current, size, ...rest } = params
    return request.get<PagedResult<SupplierContractDto>>({
      url: '/api/SupplierContracts',
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    })
  },

  getById(id: string) {
    return request.get<SupplierContractDto>({
      url: `/api/SupplierContracts/${id}`,
    })
  },

  getAuditLogs(id: string) {
    return request.get<SupplierContractAuditLogDto[]>({
      url: `/api/SupplierContracts/${id}/audit-logs`,
    })
  },

  getDeletedList(params: SupplierContractListParams) {
    const { current, size, ...rest } = params
    return request.get<PagedResult<SupplierContractDto>>({
      url: '/api/SupplierContracts/deleted',
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    })
  },

  create(data: Partial<SupplierContractDto>) {
    return request.post<SupplierContractDto>({
      url: '/api/SupplierContracts',
      data,
    })
  },

  update(id: string, data: Partial<SupplierContractDto>) {
    return request.put<SupplierContractDto>({
      url: `/api/SupplierContracts/${id}`,
      data,
    })
  },

  updateStatus(id: string, data: { status: SupplierContractStatus }) {
    return request.put<SupplierContractDto>({
      url: `/api/SupplierContracts/${id}`,
      data,
    })
  },

  delete(id: string) {
    return request.del({
      url: `/api/SupplierContracts/${id}`,
    })
  },

  restore(id: string) {
    return request.post<SupplierContractDto>({
      url: `/api/SupplierContracts/restore/${id}`,
    })
  },

  getStatistics() {
    return request.get<SupplierContractStatisticsResponse>({
      url: '/api/SupplierContracts/statistics',
    })
  },

  getSuppliersForSelect() {
    return request.get<{ id: string; name: string }[]>({
      url: '/api/SupplierContracts/suppliers-for-select',
    })
  },
}
