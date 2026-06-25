export type SalesContractStatus = "Draft" | "Signed" | "Fulfilled";

export interface SalesContractListDto {
  id: string;
  contractNumber: string;
  orderId: number;
  status: SalesContractStatus;
  customerName: string;
  vehicle: string;
  deliveryDeadline?: string;
  progress: string;
  actualSalePrice: number;
  signedDate?: string;
  scannedFileUrl?: string;
  createdAt: string;
}

export interface SalesContractDetailDto {
  id: string;
  contractNumber: string;
  orderId: number;
  outputId: number;
  status: SalesContractStatus;
  signedDate?: string;
  scannedFileUrl?: string;
  specialTerms?: string;
  warrantyPeriod?: string;
  warrantyScope?: string;
  note?: string;

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
  orderId: number;
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
