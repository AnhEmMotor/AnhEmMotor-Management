export interface QuotationItemRequest {
  productVariantId: string
  productVarientColorId?: string
  quotePrice?: number
}

export interface UpdateQuotationItemRequest {
  id?: number
  productVariantId: string
  productVarientColorId?: string
  quotePrice?: number
}

export interface QuotationItemResponse {
  productVariantId?: number
  productVariantDisplayName?: string
  productVariantColorId?: number
  productVariantColorDisplayName?: string
  quotePrice?: number
}

export interface QuotationDetailResponse {
  id?: number
  supplierId?: number
  supplierName?: string
  status?: string
  note?: string
  quotationItems?: QuotationItemResponse[]
  lastUpdatedAt?: string
}

export interface QuotationSummaryResponse {
  id?: number
  supplierId?: number
  supplierName?: string
  productCount?: number
  status?: string
  lastUpdatedAt?: string
}

export interface QuotationListResponse {
  items: QuotationSummaryResponse[]
  totalCount: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
}

export interface CreateQuotationCommand {
  supplierId?: number
  notes?: string
  products: QuotationItemRequest[]
}

export interface UpdateQuotationCommand {
  id?: number
  supplierId?: number
  notes?: string
  products: UpdateQuotationItemRequest[]
}
