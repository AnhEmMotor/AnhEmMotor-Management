export type SalesContractStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Signed' | 'Fulfilled' | 'Rejected';

export interface SalesContractListDto {
  id: string;
  contractNumber: string;
  orderId?: number;
  invoiceId: number;
  invoiceNumber?: string;
  outputId?: number;
  status: SalesContractStatus;
  customerFullName?: string;
  vehicleModel?: string;
  vehicleVersion?: string;
  vehicleColor?: string;
  finalPaymentDeadline?: string;
  actualSalePrice: number;
  signedDate?: string;
  scannedFileUrl?: string;
  rejectReason?: string;
  createdAt: string;
}

export interface SalesContractDetailDto {
  id: string;
  contractNumber: string;
  orderId?: number;
  invoiceId: number;
  invoiceNumber?: string;
  outputId: number;
  status: SalesContractStatus;
  signedDate?: string;
  scannedFileUrl?: string;
  specialTerms?: string;
  warrantyPeriod?: string;
  warrantyScope?: string;
  note?: string;
  rejectReason?: string;

  showroomName?: string;
  showroomTaxCode?: string;
  showroomAddress?: string;
  showroomRepresentative?: string;

  customerFullName: string;
  customerCCCD?: string;
  customerAddress: string;
  customerPhone: string;

  vehicleModel: string;
  vehicleVersion?: string;
  vehicleColor?: string;
  frameNumber: string;
  engineNumber: string;
  actualSalePrice: number;

  depositAmount: number;
  remainingAmount: number;
  finalPaymentDeadline?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesContractRequest {
  orderId?: number;
  invoiceId: number;
  specialTerms?: string;
  warrantyPeriod?: string;
  warrantyScope?: string;
  note?: string;
}

export interface UpdateSalesContractRequest {
  specialTerms?: string;
  warrantyPeriod?: string;
  warrantyScope?: string;
  note?: string;
}

export interface UploadScannedFileRequest {
  file: File;
}

export interface UpdateContractStatusRequest {
  status: SalesContractStatus;
}
