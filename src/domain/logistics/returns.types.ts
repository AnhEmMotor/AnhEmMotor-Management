export interface ReturnOrderDto {
  id: number;
  originalTrackingNumber: string;
  customerName: string;
  carrier: string;
  reason: string;
  status: string; // 'pending' | 'inspecting' | 'completed'
  createdAt: string;
}

export interface ReturnDetailItemDto {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  thumbnailUrl?: string;
  quantity: number;
}

export interface ReturnDetailDto {
  id: number;
  trackingNumber: string;
  originalTrackingNumber: string;
  customerName: string;
  carrier: string;
  reason: string;
  status: string;
  createdAt: string;
  boxCondition?: string;
  productCondition?: string;
  returnProofImage?: string;
  returnInternalNote?: string;
  returnAction?: string;
  refundAmount?: number;
  returnShippingCost?: number;
  codAmount?: number;
  shippingCost?: number;
  carrierReturnNote?: string;
  items: ReturnDetailItemDto[];
}

export interface InspectReturnCommand {
  boxCondition?: string;
  productCondition?: string;
  returnProofImage?: string;
  returnInternalNote?: string;
  action: string; // 'restock', 'defect', 'refund'
  refundAmount?: number;
  returnShippingCost?: number;
}
