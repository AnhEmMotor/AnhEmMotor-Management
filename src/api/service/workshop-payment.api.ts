import request from "@/common/utils/http";

export interface WorkshopPayment {
  id: number;
  paymentNumber: string;
  sourceType: string;
  sourceId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string;
  serviceDescription?: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  receivedByName?: string;
  paidAt?: string;
  notes?: string;
  invoicePrintedAt?: string;
  createdAt?: string;
}

export interface WorkshopPaymentList {
  items: WorkshopPayment[];
  totalCount: number;
}

export interface CreateWorkshopPaymentPayload {
  sourceType: string;
  sourceId: number;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string;
  serviceDescription?: string;
  subTotal: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: string;
  notes?: string;
}

export const PAYMENT_METHODS = [
  { label: "Tiền mặt", value: "Cash" },
  { label: "Chuyển khoản", value: "Transfer" },
  { label: "Thẻ", value: "Card" },
  { label: "VNPay", value: "VNPay" },
  { label: "MoMo", value: "MoMo" },
] as const;

export const PAYMENT_STATUSES = [
  { label: "Đã thanh toán", value: "Paid" },
  { label: "Chưa thanh toán", value: "Unpaid" },
  { label: "Thanh toán một phần", value: "Partial" },
  { label: "Hoàn tiền", value: "Refunded" },
] as const;

export const SOURCE_TYPES = [
  { label: "Phiếu sửa chữa", value: "RepairOrder" },
  { label: "Phiếu bảo trì", value: "Maintenance" },
  { label: "Phiếu bảo hành", value: "Warranty" },
  { label: "Đặt dịch vụ", value: "ServiceBooking" },
] as const;

export const WorkshopPaymentApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<WorkshopPaymentList>({
      url: "/api/v1/WorkshopPayments",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getDetail(id: number) {
    return request.get<WorkshopPayment>({
      url: `/api/v1/WorkshopPayments/${id}`,
    });
  },

  create(data: CreateWorkshopPaymentPayload) {
    return request.post<number>({
      url: "/api/v1/WorkshopPayments",
      data,
    });
  },

  getStats() {
    return request.get<any>({
      url: "/api/v1/WorkshopPayments/stats",
    });
  },
};

export type WorkshopPaymentApiType = typeof WorkshopPaymentApi;
