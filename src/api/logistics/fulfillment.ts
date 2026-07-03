import request from "@/common/utils/http";

export interface FulfillmentItemDto {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  thumbnailUrl?: string;
  shelfLocation: string;
  quantity: number;
  isPicked: boolean;
  isRestricted: boolean;
  isOutOfStock: boolean;
}

export interface FulfillmentDetailResponse {
  id: number;
  trackingNumber: string;
  originalOrderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  carrier: string;
  status: number;
  codAmount: number;
  shippingCost: number;
  createdAt: string;
  expectedAt?: string;
  deliveredAt?: string;
  items: FulfillmentItemDto[];
}

export function getFulfillmentDetail(id: number) {
  return request.get<FulfillmentDetailResponse>({
    url: `/api/v1/logistics/fulfillment/${id}`,
    showErrorMessage: false,
  });
}

export function updateParcelStatus(id: number, newStatus: number) {
  return request.put({
    url: `/api/v1/logistics/fulfillment/${id}/status`,
    data: { newStatus },
  });
}

export function updateTrackingNumber(id: number, trackingNumber: string) {
  return request.put({
    url: `/api/v1/logistics/fulfillment/${id}/tracking`,
    data: { trackingNumber },
  });
}

export function toggleItemPick(itemId: number, isPicked: boolean) {
  return request.put({
    url: `/api/v1/logistics/fulfillment/items/${itemId}/toggle-pick`,
    data: { isPicked },
  });
}

export interface FulfillmentOrdersParams {
  status?: number;
  carrier?: string;
  fromDate?: string;
  toDate?: string;
}

export function getFulfillmentOrders(params?: FulfillmentOrdersParams) {
  return request.get<FulfillmentDetailResponse[]>({
    url: "/api/v1/logistics/fulfillment",
    params,
  });
}
