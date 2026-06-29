export interface ReturnRequestItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  thumbnailUrl?: string;
  quantity: number;
  returnQuantity: number;
  unitPrice: number;
}

export interface ReturnRequestDetail {
  id: number;
  orderId: number;
  orderCode: string;
  originalTrackingNumber: string;
  customerName: string;
  customerPhone: string;
  carrier: string;
  type: "return" | "cancel";
  status: "pending" | "inspecting" | "completed" | "rejected";
  reason: string;
  cancelReason?: string;
  note?: string;
  returnAction?: "restock" | "defect" | "refund";
  evidenceImages?: string[];
  rejectionReason?: string;
  createdAt: string;
  inspectedAt?: string;
  items: ReturnRequestItem[];
}

export interface ReturnRequestListResponse {
  items: ReturnRequestDetail[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CreateReturnRequestCommand {
  orderId: number;
  type: "return";
  reason: string;
  note?: string;
  evidenceImages?: string[];
  items: Array<{
    productId: number;
    returnQuantity: number;
  }>;
  returnAction: "restock" | "defect" | "refund";
}

export interface CreateCancelRequestCommand {
  orderId: number;
  type: "cancel";
  reason: string;
  note?: string;
}
