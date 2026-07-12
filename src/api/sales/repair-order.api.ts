import request from "@/common/utils/http";

export interface RepairOrderDetail {
  id?: number;
  repairOrderId?: number;
  serviceId?: number;
  serviceName?: string;
  productVariantId?: number;
  variantName?: string;
  productCode?: string;
  count: number;
  price: number;
  laborCost: number;
  type: "Service" | "Part";
  notes?: string;
}

export interface RepairOrder {
  id: number;
  maintenanceNumber: string;
  vehicleId: number;
  vehicleInfo?: string;
  maintenanceDate: string;
  description: string;
  mileage: number;
  technicianId?: number;
  technicianName?: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  partsJson?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceOdo?: number;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  status: string;
  details?: RepairOrderDetail[];
  customerPhone?: string;
  customerName?: string;
  licensePlate?: string;
  vehicle?: any;
  totalAmount?: number;
}

export interface RepairOrderList {
  items: RepairOrder[];
  totalCount: number;
}

export interface CreateRepairOrderPayload {
  vehicleId?: number;
  customerName: string;
  customerPhone: string;
  mileage: number;
  description: string;
}

export interface UpdateRepairOrderPayload {
  id: number;
  vehicleId: number;
  maintenanceDate: string;
  description: string;
  mileage: number;
  technicianId?: number | null;
  partsCost: number;
  laborCost: number;
  partsJson?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceOdo?: number | null;
}

export interface PartItemPayload {
  productVariantId: number;
  count: number;
  price: number;
  notes?: string;
}

export interface ServiceItemPayload {
  serviceId: number;
  laborCost: number;
  notes?: string;
}

export interface IssuePartsPayload {
  repairOrderId: number;
  parts: PartItemPayload[];
  services: ServiceItemPayload[];
  status?: string;
}

export interface CompleteRepairOrderPayload {
  repairOrderId: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

export const RepairOrderApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<RepairOrderList>({
      url: "/api/v1/RepairOrders",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getDetail(id: number) {
    return request.get<RepairOrder>({
      url: `/api/v1/RepairOrders/${id}`,
    });
  },

  create(data: CreateRepairOrderPayload) {
    return request.post<number>({
      url: "/api/v1/RepairOrders",
      data,
    });
  },

  update(id: number, data: UpdateRepairOrderPayload) {
    return request.put<boolean>({
      url: `/api/v1/RepairOrders/${id}`,
      data,
    });
  },

  issueParts(data: IssuePartsPayload) {
    return request.post<boolean>({
      url: "/api/v1/RepairOrders/issue-parts",
      data,
    });
  },

  assignTechnician(data: { repairOrderId: number; technicianId: number }) {
    return request.put<boolean>({
      url: `/api/v1/RepairOrders/${data.repairOrderId}/assign-technician`,
      data,
    });
  },

  complete(data: CompleteRepairOrderPayload) {
    return request.post<boolean>({
      url: "/api/v1/RepairOrders/complete",
      data,
    });
  },
};
