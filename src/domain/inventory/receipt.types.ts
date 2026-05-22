export interface InputInfo {
  id?: number
  productVarientId: number
  productVarientColorId?: number
  productVarientColorName?: string
  name?: string
  quantity: number // backend uses Quantity for response, Count for request
  unitPrice?: number
  importPrice: number // backend uses ImportPrice for response, InputPrice for request
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
    productVarientId: number
    productVarientColorId?: number
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
    productVarientId: number
    productVarientColorId?: number
    count: number
    inputPrice: number
    vehicles?: Array<{
      id?: number
      vinNumber: string
      engineNumber: string
    }>
  }>
}
