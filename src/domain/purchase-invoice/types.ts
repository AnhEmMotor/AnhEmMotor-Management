export type PurchaseInvoiceItem = {
  id?: number;
  purchaseInvoiceId?: number;
  purchaseRequestItemId?: number;
  productVariantId: number;
  productVariantColorId?: number;
  productName?: string;
  variantName?: string;
  colorName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  totalAmount?: number;
};

export type PurchaseInvoice = {
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
};

export type PurchaseInvoiceListResult = {
  items: PurchaseInvoice[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

export type CreatePurchaseInvoicePayload = {
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
};
