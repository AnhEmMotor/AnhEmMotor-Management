export interface ActiveShipmentItem {
  id: number;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  carrier: string;
  status: number;
  codAmount: number;
  shippingCost: number;
  createdAt: string;
  expectedAt: string | null;
  daysInTransit: number;
  isStuck: boolean;
}
