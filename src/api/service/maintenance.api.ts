import request from "@/common/utils/http";

export interface MaintenancePart {
  partName: string;
  partCode: string;
  unitPrice: number;
}

export interface MaintenanceTicketListItem {
  id: number;
  maintenanceNumber: string;
  vehiclePlate: string;
  customerName: string;
  customerPhone: string;
  maintenanceDate: string;
  mileage: number;
  totalCost: number;
}

export interface MaintenanceTicketDetail {
  id: number;
  maintenanceNumber: string;
  maintenanceDate: string;
  mileage: number;
  description: string;
  technicianId?: number;
  technicianName?: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  nextMaintenanceDate?: string;
  nextMaintenanceOdo?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleVin?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  vehicleYear?: string;
  parts: MaintenancePart[];
}

export interface MaintenanceTicketListResponse {
  items: MaintenanceTicketListItem[];
  totalCount: number;
}

export const MaintenanceApi = {
  getList(params?: any) {
    const { current, size, ...rest } = params || {};
    return request.get<MaintenanceTicketListResponse>({
      url: "/api/v1/Maintenance",
      params: {
        page: current,
        pageSize: size,
        ...rest,
      },
    });
  },

  getDetail(id: number) {
    return request.get<MaintenanceTicketDetail>({
      url: `/api/v1/Maintenance/${id}`,
    });
  },

  create(data: {
    licensePlate: string;
    description: string;
    mileage: number;
    technicianId?: number;
    laborCost: number;
    cycleKm?: number;
    cycleMonths?: number;
    parts?: MaintenancePart[];
  }) {
    return request.post<number>({
      url: "/api/v1/Maintenance",
      data,
    });
  },

  updateOdo(id: number, currentOdo: number) {
    return request.put<boolean>({
      url: `/api/v1/Maintenance/${id}/odo`,
      data: { currentOdo },
    });
  },
};
