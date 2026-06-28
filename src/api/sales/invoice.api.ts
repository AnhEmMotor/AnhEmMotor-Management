import request from "@/common/utils/http";

export interface InvoiceSummaryResponse {
  id: number;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  type: string;
}

export interface InvoiceItemDto {
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetailResponse {
  id: number;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  items: InvoiceItemDto[];
  pdfDownloadUrl?: string;
}

export interface AdminInvoiceSummaryResponse {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export interface AdminInvoiceDetailResponse {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  paymentBreakdown: Array<{ method: string; amount: number; note?: string }>;
}

export interface CreateAdminInvoiceRequest {
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  paymentMethod: string;
  bankName?: string;
  salesPerson?: string;
  deliveryDate?: string;
  paymentBreakdown?: Array<{ method: string; amount: number; note?: string }>;
}

export interface UpdateAdminInvoiceRequest {
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  paymentBreakdown?: Array<{ method: string; amount: number; note?: string }>;
}

export interface UpdateInvoiceStatusRequest {
  status: string;
  processedBy?: string;
}

export const invoiceApi = {
  getList() {
    return request.get<InvoiceSummaryResponse[]>({
      url: "/api/v1/client/invoices",
    });
  },
  getDetail(id: number) {
    return request.get<InvoiceDetailResponse>({
      url: `/api/v1/client/invoices/${id}`,
    });
  },
  // Admin endpoints
  getAdminList(params: {
    Page?: number;
    PageSize?: number;
    SortField?: string;
    SortOrder?: string;
    Filters?: string;
  }) {
    return request.get<{
      items: AdminInvoiceSummaryResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>({
      url: "/api/v1/Admin/invoices",
      params,
    });
  },
  getAdminDetail(id: number) {
    return request.get<AdminInvoiceDetailResponse>({
      url: `/api/v1/Admin/invoices/${id}`,
    });
  },
  createAdmin(data: CreateAdminInvoiceRequest) {
    return request.post<AdminInvoiceDetailResponse>({
      url: "/api/v1/Admin/invoices",
      data,
    });
  },
  updateAdmin(id: number, data: UpdateAdminInvoiceRequest) {
    return request.put<AdminInvoiceDetailResponse>({
      url: `/api/v1/Admin/invoices/${id}`,
      data,
    });
  },
  updateAdminStatus(id: number, data: UpdateInvoiceStatusRequest) {
    return request.patch<AdminInvoiceDetailResponse>({
      url: `/api/v1/Admin/invoices/${id}/status`,
      data,
    });
  },
};
