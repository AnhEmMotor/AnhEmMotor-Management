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
  vehicleId?: number;
  vehicle?: any;
  licensePlate?: string;
  customerName: string;
  customerPhone: string;
  mileage: number;
  description: string;
  technicianId?: number;
  technicianName?: string;
  status: "Pending" | "InProgress" | "QcPending" | "Completed" | "Cancelled";
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  paymentStatus: "Unpaid" | "Paid";
  paymentMethod?: string;
  notes?: string;
  completedDate?: string;
  createdAt: string;
  details: RepairOrderDetail[];
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

export interface AssignTechnicianPayload {
  repairOrderId: number;
  technicianId: number;
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

  assignTechnician(data: AssignTechnicianPayload) {
    return request.post<boolean>({
      url: "/api/v1/RepairOrders/assign-technician",
      data,
    });
  },

  issueParts(data: IssuePartsPayload) {
    return request.post<boolean>({
      url: "/api/v1/RepairOrders/issue-parts",
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
