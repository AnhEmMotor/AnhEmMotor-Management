import request from "@/common/utils/http";

export interface PurchaseInvoiceItem {
  id: number;
  purchaseInvoiceId: number;
  purchaseRequestItemId?: number;
  productVariantId: number;
  productVariantColorId?: number;
  productName?: string;
  variantName?: string;
  colorName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  purchaseRequestId?: number;
  supplierId?: number;
  supplierName?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  supplierTaxCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerIdCard?: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  notes?: string;
  totalItems: number;
  createdAt?: string;
  items: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceListResult {
  items: PurchaseInvoice[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreatePurchaseInvoicePayload {
  purchaseRequestId?: number;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  supplierId?: number;
  supplierName?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  supplierTaxCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerIdCard?: string;
  paymentMethod?: string;
  notes?: string;
  items: Array<{
    purchaseRequestItemId?: number;
    productVariantId: number;
    productVariantColorId?: number;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}

export const INVOICE_STATUSES = [
  { label: "Bản nháp", value: "draft" },
  { label: "Đã gửi", value: "sent" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Đã từ chối", value: "rejected" },
  { label: "Đã hủy", value: "cancelled" },
] as const;

export const PAYMENT_METHODS = [
  { label: "Tiền mặt", value: "cash" },
  { label: "Chuyển khoản", value: "transfer" },
  { label: "Thẻ", value: "card" },
] as const;

export const PAYMENT_STATUSES = [
  { label: "Chưa thanh toán", value: "unpaid" },
  { label: "Đã thanh toán", value: "paid" },
  { label: "Thanh toán một phần", value: "partial" },
] as const;

export const purchaseInvoiceApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PurchaseInvoiceListResult>({
      url: "/api/v1/purchaseinvoices",
      params: { Page: current, PageSize: size, ...rest },
    });
  },

  getDetail(id: number) {
    return request.get<PurchaseInvoice>({
      url: `/api/v1/purchaseinvoices/${id}`,
    });
  },

  create(data: CreatePurchaseInvoicePayload) {
    return request.post<number>({
      url: "/api/v1/purchaseinvoices",
      data,
    });
  },
};

export type purchaseInvoiceApiType = typeof purchaseInvoiceApi;
