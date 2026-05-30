export interface CreateQuotationItemRequest {
  productVariantId: string
  productVarientColorId?: string
  quotePrice?: number
  note?: string
}

export interface UpdateQuotationItemRequest {
  id?: number
  productVariantId: string
  productVarientColorId?: string
  quotePrice?: number
  note?: string
}

export interface QuotationItemResponse {
  id?: number
  productVariantId?: number
  productVariantDisplayName?: string
  productVariantColorId?: number
  productVariantColorDisplayName?: string
  quotePrice?: number
  note?: string
}

export interface QuotationDetailResponse {
  id?: number
  supplierId?: number
  supplierName?: string
  status?: string
  notes?: string
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
  products: CreateQuotationItemRequest[]
}

export interface UpdateQuotationCommand {
  id?: number
  supplierId?: number
  notes?: string
  products: UpdateQuotationItemRequest[]
}
