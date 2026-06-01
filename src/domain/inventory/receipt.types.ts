export interface InputInfo {
  id?: number
  productVariantId: number
  productVariantColorId?: number
  productVariantColorName?: string
  name?: string
  quantity: number
  remainingCount?: number
  purchaseOrderItemId?: number
  supplierId?: number
  supplierName?: string
  vehicles?: Array<{
    id?: number
    vinNumber: string
    engineNumber: string
  }>
}

export interface InventoryReceipt {
  id: number
  notes?: string
  statusId: string
  supplierId: number
  supplierName?: string
  createdAt?: string
  purchaseOrderId?: number
  products: InputInfo[]
}

export interface InventoryReceiptList {
  items: InventoryReceipt[]
  totalCount: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
}

export interface CreateInventoryReceipt {
  notes?: string
  statusId?: string
  supplierId?: number
  purchaseOrderId?: number
  products: Array<{
    purchaseOrderItemId?: number
    productVariantId: number
    productVariantColorId?: number
    count: number
    vehicles?: Array<{
      id?: number
      vinNumber: string
      engineNumber: string
    }>
  }>
}

export interface UpdateInventoryReceipt {
  statusId?: string
  supplierId?: number
  purchaseOrderId?: number
  notes?: string
  products: Array<{
    id?: number
    purchaseOrderItemId?: number
    productVariantId: number
    productVariantColorId?: number
    count: number
    vehicles?: Array<{
      id?: number
      vinNumber: string
      engineNumber: string
    }>
  }>
}
