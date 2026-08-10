export type SupplierContractStatus =
  'Draft' | 'PendingApproval' | 'Active' | 'Expired' | 'Terminated' | 'Completed';

export interface SupplierContractSkuItem {
  id?: string;
  productVariantId: number;
  skuCode?: string;
  productName?: string;
  category?: string;
  wholesalePrice: number;
  moq?: number;
}

export interface SupplierContractAuditLogDto {
  id: string;
  supplierContractId: string;
  action: string;
  details?: string;
  changedBy?: string;
  ipAddress?: string;
  oldValue?: string;
  newValue?: string;
  createdAt?: string;
}

export interface SupplierContractDto {
  id: string;
  supplierId?: number;
  supplierName?: string;
  supplierCode?: string;
  contractNumber: string;
  contractFilePath?: string;
  effectiveDate: string;
  expirationDate?: string;
  contractValue: number;
  status: SupplierContractStatus;
  terms?: string;
  note?: string;

  creditLimit?: number;
  paymentWindowDays?: number;
  bankAccountNumber?: string;
  bankName?: string;
  minimumVolumePerMonth?: number;
  discountRate?: number;
  parentContractId?: string;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  supplierContactName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  skuPriceList?: SupplierContractSkuItem[];
  auditLogs?: SupplierContractAuditLogDto[];
}

export interface SupplierContractStatisticsResponse {
  totalContracts: number;
  activeContracts: number;
  pendingApproval: number;
  expiredContracts: number;
  expiringContracts: number;
}

export interface SupplierContractListParams {
  current: number;
  size: number;
  filters?: string;
  sorts?: string;
  name?: string;
  contractNumber?: string;
  status?: string[];
  supplierId?: string | number;
}

export interface SupplierContractMutation {
  supplierId?: number;
  contractNumber?: string;
  contractFilePath?: string;
  effectiveDate?: string;
  expirationDate?: string;
  contractValue?: number;
  status?: SupplierContractStatus;
  terms?: string;
  note?: string;
  creditLimit?: number;
  paymentWindowDays?: number;
  bankAccountNumber?: string;
  bankName?: string;
  minimumVolumePerMonth?: number;
  discountRate?: number;
  parentContractId?: string;
  contractItems?: Array<{
    productVariantId: number;
    wholesalePrice: number;
  }>;
}

export interface GetSupplierContractDetailResult {
  contract: SupplierContractDto;
  auditLogs: SupplierContractAuditLogDto[];
}
