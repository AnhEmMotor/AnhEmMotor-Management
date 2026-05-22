export interface InputInfo {
  id?: number
  productVariantId: number
  productVariantColorId?: number
  productVariantColorName?: string
  name?: string
  quantity: number
  unitPrice?: number
  importPrice: number
  discount?: number
  total?: number
  remainingCount?: number
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
  supplierPhone?: string
  supplierEmail?: string
  createdAt?: string
  totalPayable?: number
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
  products: Array<{
    productVariantId: number
    productVariantColorId?: number
    count: number
    inputPrice: number
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
  notes?: string
  products: Array<{
    id?: number
    productVariantId: number
    productVariantColorId?: number
    count: number
    inputPrice: number
    vehicles?: Array<{
      id?: number
      vinNumber: string
      engineNumber: string
    }>
  }>
}
