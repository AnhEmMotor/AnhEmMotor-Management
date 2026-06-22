export interface InputInfo {
  id?: number;
  productVariantId: number;
  productVariantColorId?: number;
  productVariantColorName?: string;
  name?: string;
  quantity: number;
  remainingCount?: number;
  purchaseRequestItemId?: number;
  vehicles?: Array<{
    id?: number;
    vinNumber: string;
    engineNumber: string;
  }>;
}

export interface InventoryReceipt {
  id: number;
  notes?: string;
  statusId: string;
  supplierId?: number;
  supplierName?: string;
  createdAt?: string;
  purchaseRequestId?: number;
  createdByName?: string;
  sentByName?: string;
  approvedByName?: string;
  rejectedByName?: string;
  products: InputInfo[];
}

export interface InventoryReceiptList {
  items: InventoryReceipt[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CreateInventoryReceipt {
  notes?: string;
  statusId?: string;
  supplierId?: number;
  purchaseRequestId?: number;
  products: Array<{
    purchaseRequestItemId?: number;
    count: number;
    vehicles?: Array<{
      id?: number;
      vinNumber: string;
      engineNumber: string;
    }>;
  }>;
}

export interface UpdateInventoryReceipt {
  statusId?: string;
  supplierId?: number;
  purchaseRequestId?: number;
  notes?: string;
  products: Array<{
    id?: number;
    purchaseRequestItemId?: number;
    count: number;
    vehicles?: Array<{
      id?: number;
      vinNumber: string;
      engineNumber: string;
    }>;
  }>;
}
