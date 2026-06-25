import request from "@/utils/http";

export interface Vehicle {
  id: number;
  fullName: string;
  phoneNumber: string;
  vinNumber: string;
  engineNumber: string;
  licensePlate: string;
  purchaseDate: string;
  leadId: number;
  productId?: number;
  isActive: boolean;
}

export interface MaintenanceAlert {
  title: string;
  severity: string;
  type: "warning" | "danger" | "info" | "success";
  description: string;
}

export interface VehiclePortfolioResponse {
  vehicle: Vehicle;
  history: any[]; // Replace 'any' with RepairOrder if imported
  totalHistoryCount: number;
  alerts: MaintenanceAlert[];
}

export interface VehicleList {
  items: Vehicle[];
  totalCount: number;
}

export const VehicleApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<VehicleList>({
      url: "/api/v1/Vehicle",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getById(id: number) {
    return request.get<Vehicle>({
      url: `/api/v1/Vehicle/${id}`,
    });
  },

  create(data: any) {
    return request.post<Vehicle>({
      url: "/api/v1/Vehicle",
      data,
    });
  },

  updateLicensePlate(id: number, licensePlate: string) {
    return request.patch<boolean>({
      url: `/api/v1/Vehicle/${id}/license-plate`,
      data: { licensePlate },
    });
  },

  getPortfolio(params: {
    query: string;
    queryType: string;
    page: number;
    pageSize: number;
  }) {
    return request.get<VehiclePortfolioResponse>({
      url: "/api/v1/Vehicle/portfolio",
      params,
    });
  },
};
