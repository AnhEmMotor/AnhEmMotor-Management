export interface CreatePurchaseRequestItemRequest {
  productVariantId?: number
  productVariantColorId?: number
  quantity?: number
}

export interface CreatePurchaseRequest {
  note?: string
  items: CreatePurchaseRequestItemRequest[]
}

export interface UpdatePurchaseRequestItemRequest {
  id?: number
  productVariantId?: number
  productVariantColorId?: number
  quantity?: number
}

export interface UpdatePurchaseRequest {
  id: number
  note?: string
  items: UpdatePurchaseRequestItemRequest[]
}

export interface PurchaseRequestItemResponse {
  id: number
  productVariantId: number
  productName?: string
  productVariantColorId?: number
  productVariantColorName?: string
  quantity: number
  importedQuantity: number
  pendingQuantity: number
  unimportedQuantity: number
}

export interface PurchaseRequestDetailResponse {
  id: number
  status: string
  note?: string
  createdBy?: string
  createdByName?: string
  approvedBy?: string
  approvedByName?: string
  createdAt?: string
  items: PurchaseRequestItemResponse[]
}

export interface PurchaseRequestListResponse {
  id: number
  status: string
  note?: string
  createdByName?: string
  createdAt?: string
  totalItems: number
}

export interface PurchaseRequestList {
  items: PurchaseRequestListResponse[]
  totalCount: number
}

export interface PurchaseRequestQuotedPriceResponse {
  productVariantId: number
  productVariantColorId?: number
  supplierId: number
  supplierName: string
  quotePrice: number
  note?: string
}

export interface ApprovedPurchaseRequestItemResponse {
  id: number
  productVariantId: number
  productName?: string
  productVariantColorId?: number
  productVariantColorName?: string
  unimportedQuantity: number
  needVin: boolean
}

export interface ApprovedPurchaseRequestDetailResponse {
  id: number
  note?: string
  createdBy?: string
  createdByName?: string
  approvedBy?: string
  approvedByName?: string
  createdAt?: string
  items: ApprovedPurchaseRequestItemResponse[]
}
