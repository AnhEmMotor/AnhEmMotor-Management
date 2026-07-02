export type PaymentSourceType =
  | "RepairOrder"
  | "Maintenance"
  | "Warranty"
  | "ServiceBooking";

export type PaymentMethod = "Cash" | "Transfer" | "Card" | "VNPay" | "MoMo";

export type PaymentStatus = "Paid" | "Unpaid" | "Partial" | "Refunded";

export interface PaymentItem {
  id: number;
  paymentNumber: string;
  sourceType: PaymentSourceType;
  sourceId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string;
  serviceDescription?: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receivedByName?: string;
  paidAt?: string;
  notes?: string;
  invoicePrintedAt?: string;
  createdAt?: string;
}

export interface PaymentListResult {
  items: PaymentItem[];
  totalCount: number;
}

export interface CreatePaymentPayload {
  sourceType: PaymentSourceType;
  sourceId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string;
  serviceDescription?: string;
  subTotal: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface PaymentDetail extends PaymentItem {
  sourceLabel: string;
  canPrintInvoice: boolean;
}
