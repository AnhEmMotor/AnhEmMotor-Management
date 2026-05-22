export interface OrderProduct {
  id?: number
  productVariantId: number
  productVariantColorId?: number
  productId?: number
  productName?: string
  productVariantName?: string
  count: number
  price?: number
  costPrice?: number
  coverImageUrl?: string
  assignedVehicles?: VehicleAssignmentOption[]
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
    productVariantId: number
    productVariantColorId?: number
    count: number
  }>
}

export interface UpdateSalesOrderForManager extends CreateSalesOrderByManager {
  products: Array<{
    id?: number
    productVariantId: number
    productVariantColorId?: number
    count: number
  }>
}

export interface VehicleAssignmentOption {
  id: number
  vinNumber: string
  engineNumber: string
  status: string
}

export interface VehicleAssignmentRequirementItem {
  outputInfoId: number
  productId?: number
  productName?: string
  productVariantId?: number
  productVariantName?: string
  productVariantColorId?: number
  colorName?: string
  requiredCount: number
  assignedVehicles: VehicleAssignmentOption[]
  availableVehicles: VehicleAssignmentOption[]
  availableCount: number
  canFulfill: boolean
}

export interface VehicleAssignmentRequirement {
  orderId: number
  targetStatusId: string
  requiresVehicleAssignment: boolean
  items: VehicleAssignmentRequirementItem[]
}
