export interface CreatePurchaseOrderItemRequest {
  productVariantId?: number
  productVariantColorId?: number
  orderedQuantity?: number
  unitPrice?: number
  purchaseRequestItemId?: number
}

export interface CreatePurchaseOrder {
  purchaseRequestId?: number
  supplierId: number
  note?: string
  items: CreatePurchaseOrderItemRequest[]
}

export interface UpdatePurchaseOrderItemRequest {
  id?: number
  productVariantId?: number
  productVariantColorId?: number
  orderedQuantity?: number
  unitPrice?: number
  purchaseRequestItemId?: number
}

export interface UpdatePurchaseOrder {
  id: number
  purchaseRequestId?: number
  supplierId: number
  note?: string
  items: UpdatePurchaseOrderItemRequest[]
}

export interface PurchaseOrderItemResponse {
  id: number
  purchaseOrderId: number
  productVariantId: number
  productName?: string
  productVariantColorId?: number
  productVariantColorName?: string
  orderedQuantity: number
  unitPrice: number
  purchaseRequestItemId?: number
  importedQuantity?: number
}

export interface PurchaseOrderDetailResponse {
  id: number
  purchaseRequestId?: number
  supplierId: number
  supplierName?: string
  status: string
  note?: string
  orderDate?: string
  createdAt?: string
  createdBy?: string
  createdByName?: string
  sentBy?: string
  sentByName?: string
  approvedBy?: string
  approvedByName?: string
  rejectedBy?: string
  rejectedByName?: string
  items: PurchaseOrderItemResponse[]
}

export interface PurchaseOrderListResponse {
  id: number
  purchaseRequestId?: number
  supplierId: number
  supplierName?: string
  status: string
  note?: string
  orderDate?: string
  createdAt?: string
  createdByName?: string
  totalItems: number
  totalAmount: number
}

export interface PurchaseOrderList {
  items: PurchaseOrderListResponse[]
  totalCount: number
}
