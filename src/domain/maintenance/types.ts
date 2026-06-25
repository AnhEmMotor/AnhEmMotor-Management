export type MaintenanceWorkflowStatus =
  | "Received"
  | "InProgress"
  | "QcPending"
  | "PaymentPending"
  | "Completed";

export interface MaintenanceWarning {
  id: string;
  level: "warning" | "danger";
  message: string;
  targetKm?: number;
}

export interface MaintenanceChecklistItem {
  id: string;
  name: string;
  // true = Đạt, false = Cần thay thế
  done: boolean;
  notes?: string;
}

export interface MaintenancePackage {
  id: string;
  name: string;
  targetKm: number;
  laborCost: number;
  discount: number;
  checklist: MaintenanceChecklistItem[];
}

export interface MaintenancePartsLine {
  id: string;
  partName: string;
  productVariantId?: number;
  availableQuantity: number;
  requiredQuantity: number;
  unitPrice: number;
  total: number;
}

export interface MaintenanceTicket {
  id?: number;
  ticketCode?: string;

  licensePlate?: string;
  customerName?: string;
  vehicleModelName?: string;

  odoHistory?: Array<{ id: string; odo: number; lastServiceDate: string }>;
  currentOdo?: number;
  lastOdoBefore?: number;

  warnings: MaintenanceWarning[];
  selectedPackage?: MaintenancePackage;
  checklist: MaintenanceChecklistItem[];

  parts: MaintenancePartsLine[];
  laborCost: number;
  discount: number;

  workflowStatus: MaintenanceWorkflowStatus;
  qcNote?: string;
  paymentMethod?: string;
}

export interface MaintenanceCreateFormVM {
  licensePlate: string;
  customerName: string;
  currentOdo: number;
  packageId: string;
}
