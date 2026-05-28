export interface Supplier {
  id: number
  name: string
  partnerTypeId: string
  phone: string
  email: string
  taxIdentificationNumber: string
  address: string
  notes: string
  status: boolean
  statusId?: string
  totalInput?: number
  createdAt?: string
  updatedAt?: string
}

export interface SupplierList {
  items: Supplier[]
  totalCount: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
}

export interface SupplierStatistics {
  totalSuppliers: number
  financialSuppliers: number
  creditSuppliers: number | string
}

export interface SupplierFilters {
  name?: string
  partnerTypeId?: string
  phone?: string
  email?: string
}

export interface PartnerType {
  key: string
  name: string
}
