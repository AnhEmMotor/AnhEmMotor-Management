export interface PurchaseInvoiceItem {
  id?: number;
  purchaseInvoiceId?: number;
  purchaseOrderItemId?: number;
  inventoryReceiptItemId?: number;
  productVariantId: number;
  productVariantName?: string;
  sku?: string;
  productVariantColorId?: number;
  colorName?: string;
  invoicedQuantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice?: number;
  taxAmount?: number;
  totalAmount?: number;
  needVin?: boolean;
  vehicles?: any[];
}

export interface PurchaseInvoice {
  id: number;
  purchaseOrderId?: number;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  note?: string;
  createdBy?: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  supplierName?: string;
  supplierId?: number;
  totalAmountBeforeTax?: number;
  totalTaxAmount?: number;
  totalAmount?: number;
  items: PurchaseInvoiceItem[];
  createdAt?: string;
}

export interface PurchaseInvoiceList {
  items: PurchaseInvoice[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CreatePurchaseInvoice {
  purchaseOrderId?: number;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  note?: string;
  items: Array<{
    purchaseOrderItemId?: number;
    inventoryReceiptItemId?: number;
    productVariantId: number;
    productVariantColorId?: number;
    invoicedQuantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}

export interface UpdatePurchaseInvoice {
  id: number;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  note?: string;
  items: Array<{
    id?: number;
    purchaseOrderItemId?: number;
    inventoryReceiptItemId?: number;
    productVariantId: number;
    productVariantColorId?: number;
    invoicedQuantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}
