export interface CreatePurchaseOrderItemRequest {
  productVariantId?: number
  productVariantColorId?: number
  orderedQuantity?: number
  unitPrice?: number
  purchaseRequestItemId?: number
  supplierId?: number
  quotationProductRowId?: number
}

export interface CreatePurchaseOrder {
  purchaseRequestId?: number
  supplierId?: number
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
  quotationProductRowId?: number
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
  quotationProductRowId?: number
  quotationId?: number
  quotationName?: string
  needVin?: boolean
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

export interface PurchaseOrderItemForInputResponse {
  id: number
  productVariantId: number
  productName?: string
  productVariantColorId?: number
  productVariantColorName?: string
  orderedQuantity: number
  unitPrice: number
  needVin: boolean
  quotationProductRowId?: number
  purchaseRequestItemId?: number
  quotationId?: number
  quotationName?: string
}

export interface PurchaseOrderDetailForInputResponse {
  id: number
  purchaseRequestId?: number
  supplierId: number
  supplierName?: string
  status: string
  orderDate: string
  note?: string
  createdBy?: string
  createdByName?: string
  sentBy?: string
  sentByName?: string
  approvedBy?: string
  approvedByName?: string
  rejectedBy?: string
  rejectedByName?: string
  createdAt?: string
  items: PurchaseOrderItemForInputResponse[]
  totalAmount: number
}

export interface PurchaseOrderItemForInvoiceResponse {
  id: number
  productVariantId: number
  productName?: string
  productVariantColorId?: number
  productVariantColorName?: string
  orderedQuantity: number
  invoicedQuantity: number
  invoicingQuantity: number
  remainingQuantity: number
  unitPrice: number
  needVin: boolean
  quotationProductRowId?: number
  purchaseRequestItemId?: number
  quotationId?: number
  quotationName?: string
  importedVehicles?: Array<{
    id: number
    vinNumber: string
    engineNumber: string
    importPrice: number
    inventoryReceiptInfoId?: number
    isLocked?: boolean
  }>
}

export interface PurchaseOrderDetailForInvoiceResponse {
  id: number
  purchaseRequestId?: number
  supplierId: number
  supplierName?: string
  status: string
  orderDate: string
  note?: string
  createdBy?: string
  createdByName?: string
  sentBy?: string
  sentByName?: string
  approvedBy?: string
  approvedByName?: string
  rejectedBy?: string
  rejectedByName?: string
  createdAt?: string
  items: PurchaseOrderItemForInvoiceResponse[]
  totalAmount: number
}
