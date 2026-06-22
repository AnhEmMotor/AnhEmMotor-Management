export interface TrackingMilestone {
  id: number;
  timestamp: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  description: string;
  carrierLogCode: string | null;
  isCurrentLocation: boolean;
  isStuck: boolean;
}

export interface TrackingProduct {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface ShipmentTrackingResponse {
  orderId: number;
  trackingNumber: string;
  originalOrderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  carrier: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  codAmount: number;
  isCodPaid: boolean;
  createdAt: string;
  expectedDelivery: string | null;
  deliveredAt: string | null;
  milestones: TrackingMilestone[];
  products: TrackingProduct[];
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
}
