export interface OrderProduct {
  id?: number
  productVarientId: number
  productVarientColorId?: number
  productId?: number
  productName?: string
  productVariantName?: string
  count: number
  price?: number
  costPrice?: number
  coverImageUrl?: string
}

export interface SalesOrder {
  id: number
  buyerId?: string
  buyerName?: string
  buyerPhone?: string
  buyerEmail?: string
  customerName?: string
  customerAddress?: string
  customerPhone?: string
  notes?: string
  statusId: string
  paymentMethod?: 'COD' | 'VNPay' | 'PayOS' | string
  depositRatio?: number
  depositAmount?: number
  remainingAmount?: number
  shippingFee?: number
  total?: number
  createdAt?: string
  products: OrderProduct[]
}

export interface SalesOrderList {
  items: SalesOrder[]
  totalCount: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
}

export interface CreateSalesOrderByManager {
  buyerId: string
  customerName: string
  customerAddress: string
  customerPhone: string
  notes?: string
  statusId?: string
  depositRatio?: number
  products: Array<{
    productVarientId: number
    productVarientColorId?: number
    count: number
  }>
}

export interface UpdateSalesOrderForManager extends CreateSalesOrderByManager {
  products: Array<{
    id?: number
    productVarientId: number
    productVarientColorId?: number
    count: number
  }>
}
