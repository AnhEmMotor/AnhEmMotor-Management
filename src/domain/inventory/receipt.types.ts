export interface InputInfo {
  id?: number
  productId: number
  name?: string
  quantity: number // backend uses Quantity for response, Count for request
  unitPrice?: number
  importPrice: number // backend uses ImportPrice for response, InputPrice for request
  discount?: number
  total?: number
  remainingCount?: number
}

export interface InventoryReceipt {
  id: number
  notes?: string
  statusId: string // 'working', 'finished', 'cancelled'
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
    productId: number
    count: number
    inputPrice: number
  }>
}

export interface UpdateInventoryReceipt {
  statusId?: string
  supplierId?: number
  notes?: string
  products: Array<{
    id?: number
    productId: number
    count: number
    inputPrice: number
  }>
}
