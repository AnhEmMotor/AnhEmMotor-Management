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
};
